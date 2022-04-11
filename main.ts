// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { npmInstall } from "./lib.ts";
import { parseArgs } from "./args.ts";
import { DepsFile } from "./deps_file.ts";
import { getPackageInstallVersion } from "./npm_api.ts";

const args = parseArgs(Deno.args);

switch (args.kind) {
  case "init": {
    const depsFile = new DepsFile();
    await depsFile.save();
    console.log("Created npm_deps.json");
    break;
  }
  case "install": {
    await installWithDepsFile(new DepsFile());
    break;
  }
  case "install-dep": {
    const depsFile = new DepsFile();
    const installVersion = await getPackageInstallVersion(args.name);
    depsFile.addDependency(args.name, `^${installVersion}`);
    await depsFile.save();
    await installWithDepsFile(depsFile);
    break;
  }
  case "install-dev-dep": {
    const depsFile = new DepsFile();
    const installVersion = await getPackageInstallVersion(args.name);
    depsFile.addDevDependency(args.name, `^${installVersion}`);
    await depsFile.save();
    await installWithDepsFile(depsFile);
    break;
  }
  case "help": {
    console.log("Todo...");
    break;
  }
  default: {
    const _assertNever: never = args;
    throw new Error("Unreachable");
  }
}

async function installWithDepsFile(depsFile: DepsFile) {
  await npmInstall({
    outDir: "./npm_deps",
    dependencies: depsFile.getDependencies(),
    devDependencies: depsFile.getDevDependencies(),
  });
}
