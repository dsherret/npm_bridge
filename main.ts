// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { npmInstall } from "./lib.ts";
import { flags } from "./deps.ts";

const args = flags.parse(Deno.args); // todo... use this
const depsFile = await readDepsFile("./npm_deps.json");

npmInstall({
  outDir: "./npm_deps",
  dependencies: depsFile.dependencies,
  devDependencies: depsFile.devDependencies,
});

async function readDepsFile(filePath: string) {
  try {
    const depsFileText = await Deno.readTextFile(filePath);
    const jsonObj = JSON.parse(depsFileText);

    return {
      dependencies: parseDependencies(jsonObj.dependencies),
      devDependencies: parseDependencies(jsonObj.devDependencies),
    };
  } catch (err) {
    const newErr = new Error(
      `Error reading configuration file at '${filePath}'`,
    );
    newErr.cause = err;
    throw newErr;
  }

  function parseDependencies(jsonDeps: any) {
    const dependencies: { [name: string]: string } = {};
    if (typeof jsonDeps === "object") {
      for (const [key, value] of Object.entries(jsonDeps)) {
        if (typeof value !== "string") {
          throw new Error(
            `The type of the ${key} dependency must be an object.`,
          );
        }
        dependencies[key] = value;
      }
    }
    return dependencies;
  }
}
