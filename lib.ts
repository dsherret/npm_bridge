// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { runCommandWithOutput } from "./utils/command.ts";
import { analyzeCjsExports, CjsAnalysis } from "./rust/mod.ts";
import { collectNodeModules, NodeModule } from "./npm/analyze.ts";
import { ImportMapBuilder } from "./repo/import_map.ts";
import { DenoJson } from "./repo/deno_json.ts";
import { getJsScriptInDirWithPrefix } from "./utils/fs.ts";
import { hasScriptExtension, stripRelative } from "./utils/path.ts";
import { path } from "./deps.ts";

export interface NpmInstallOptions {
  outDir: string;
  dependencies: { [name: string]: string };
  devDependencies: { [name: string]: string };
}

export async function npmInstall(options: NpmInstallOptions) {
  if (/[\\\/]node_modules\b/i.test(options.outDir)) {
    throw new Error(
      "Specified outDir must not include a directory called node_modules because then npm install won't work.",
    );
  }
  const importMap = new ImportMapBuilder();
  const npmPackageJsonFilePath = path.join(options.outDir, "package.json");
  const nodeModulesPath = path.join(options.outDir, "node_modules");
  const binPath = path.join(options.outDir, ".bin");

  try {
    await Deno.remove(nodeModulesPath, { recursive: true });
  } catch {
    // ignore
  }

  await Deno.mkdir(options.outDir, { recursive: true });
  await Deno.mkdir(binPath, { recursive: true });
  await Deno.writeTextFile(
    npmPackageJsonFilePath,
    JSON.stringify({
      name: "npm",
      version: "0.0.0",
      private: true,
      dependencies: options.dependencies,
      devDependencies: options.devDependencies,
    }),
  );

  await runCommandWithOutput({
    cwd: options.outDir,
    cmd: ["npm", "install"],
  });

  const nodeModules = await collectNodeModules(nodeModulesPath);
  for (const nodeModule of nodeModules) {
    await handleNodeModule(nodeModule);
  }

  const importMapPath = path.join(options.outDir, "import_map.json");
  Deno.writeTextFile(
    importMapPath,
    JSON.stringify(importMap.build(), null, 2) + "\n",
  );

  const denoJson = new DenoJson();
  denoJson.addImportMap(
    "./" + path.relative(".", importMapPath).replace(/\\/g, "/"),
  );
  await denoJson.save();

  // clean up
  try {
    await Deno.remove(npmPackageJsonFilePath);
  } catch {}

  async function handleNodeModule(nodeModule: NodeModule) {
    console.error(`Analyzing ${nodeModule.name}...`);
    const packageJson = nodeModule.packageJson;
    // todo: handle exports and module properties
    let main = packageJson.main;
    if (main == null) {
      main = await getJsScriptInDirWithPrefix(
        nodeModule.nodeModulesPath,
        "index",
      );
      if (main == null) {
        throw new Error("Not implemented: no main");
      }
    }
    if (!hasScriptExtension(main)) {
      main = await getJsScriptInDirWithPrefix(nodeModule.nodeModulesPath, main);
      if (main == null) {
        return;
      }
    }

    const mainFilePath = path.join(
      nodeModulesPath,
      packageJson.name,
      main,
    );
    const nodeModulesSpecifier = getNodeModulesSpecifier(nodeModule);
    if (packageJson.name.includes("/")) {
      await Deno.mkdir(
        path.dirname(path.join(options.outDir, packageJson.name)),
        { recursive: true },
      );
    }
    const typesModule = nodeModules.find((m) =>
      m.name === `@types/${nodeModule.name}`
    );
    const typesSpecifier = getTypesSpecifierForModule(nodeModule, nodeModule) ??
      (typesModule == null
        ? undefined
        : getTypesSpecifierForModule(typesModule, nodeModule));
    await Deno.writeTextFile(
      path.join(options.outDir, packageJson.name + ".ts"),
      (typesSpecifier == null ? "" : `// @deno-types="${typesSpecifier}"\n`) +
        `export { default } from "${nodeModulesSpecifier}/${
          packageJson.name + ".esm.js"
        }";\n` +
        `export * from "${nodeModulesSpecifier}/${
          packageJson.name + ".esm.js"
        }";\n`,
    );
    importMap.setImport(
      packageJson.name,
      `./${packageJson.name}.ts`,
    );
    importMap.addNoExtPaths(
      ...nodeModule.scriptFiles.map((f) => path.relative(options.outDir, f)),
    );

    const mainCjsExports = await analyzeCjsExports(
      await Deno.readTextFile(mainFilePath),
    );

    await createEsmEntrypoint(
      packageJson.name,
      mainCjsExports,
      `./${packageJson.name}/${stripRelative(main)}`,
    );

    await handleBin(nodeModule);
  }

  function getTypesSpecifierForModule(
    nodeModule: NodeModule,
    rootModule: NodeModule,
  ) {
    const packageJson = nodeModule.packageJson;
    const types = packageJson.typings ?? packageJson.types;

    return types == null
      ? undefined
      : `${getNodeModulesSpecifier(rootModule)}/${packageJson.name}/${
        stripRelative(types)
      }`;
  }

  function getNodeModulesSpecifier(nodeModule: NodeModule) {
    if (nodeModule.packageJson.name.includes("/")) {
      return "../node_modules";
    } else {
      return "./node_modules";
    }
  }

  async function handleBin(nodeModule: NodeModule) {
    if (nodeModule.packageJson.bin == null) {
      return;
    }

    if (typeof nodeModule.packageJson.bin === "string") {
      await addBinForNameAndSpecifier(
        nodeModule.packageJson.name,
        nodeModule.packageJson.bin,
      );
    } else {
      for (const [key, value] of Object.entries(nodeModule.packageJson.bin)) {
        if (typeof value !== "string") {
          continue;
        }
        await addBinForNameAndSpecifier(key, value);
      }
    }

    async function addBinForNameAndSpecifier(name: string, specifier: string) {
      let source =
        `import { createRequire } from "https://deno.land/std@0.132.0/node/module.ts";\n` +
        `const require = createRequire(import.meta.url);\n` +
        `require("../node_modules/${nodeModule.packageJson.name}/${
          stripRelative(specifier)
        }");\n`;

      await Deno.writeTextFile(
        // todo: check for conflicts by keeping a list
        path.join(binPath, name + ".js"),
        source,
      );
    }
  }

  async function createEsmEntrypoint(
    exportName: string,
    cjsExports: CjsAnalysis,
    specifier: string,
  ) {
    // todo: handle re-exports

    let source =
      `import { createRequire } from "https://deno.land/std@0.132.0/node/module.ts";\n` +
      `const require = createRequire(import.meta.url);\n`;
    source += `const mod = require("${specifier}");\n`;
    if (!cjsExports.exports.some((e) => e === "default")) {
      source += `export default mod;\n`;
    }
    for (const entry of cjsExports.exports) {
      if (entry === "default") {
        source += `export default mod.default;\n`;
      } else {
        source += `export const ${entry} = mod.${entry};\n`;
      }
    }
    await Deno.writeTextFile(
      path.join(options.outDir, "node_modules", exportName + ".esm.js"),
      source,
    );
  }
}
