// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { path } from "./deps.ts";
import { readDirs } from "./utils/fs.ts";
import { hasScriptExtension } from "./utils/path.ts";

export interface NodeModule {
  name: string;
  nodeModulesPath: string;
  packageJson: {
    name: string;
    types: string | undefined;
    typings: string | undefined;
    main: string | undefined;
    dependencies?: {
      [name: string]: string;
    };
  };
  scriptFiles: string[];
}

export async function collectNodeModules(nodeModulesPath: string) {
  const modules: NodeModule[] = [];
  for await (const dirPath of readDirs(nodeModulesPath)) {
    if (path.basename(dirPath).startsWith("@")) {
      for await (const subDirPath of readDirs(dirPath)) {
        await handleNpmDir(subDirPath);
      }
    } else {
      await handleNpmDir(dirPath);
    }
  }
  return modules;

  async function handleNpmDir(dirPath: string) {
    let packageJsonText: string;
    try {
      packageJsonText = await Deno.readTextFile(
        path.join(dirPath, "package.json"),
      );
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        return;
      } else {
        throw err;
      }
    }
    const packageJson = JSON.parse(packageJsonText);
    modules.push({
      name: packageJson.name,
      nodeModulesPath: dirPath,
      packageJson,
      scriptFiles: await collectScriptFiles(),
    });

    async function collectScriptFiles() {
      const scriptFiles: string[] = [];
      await fillInDir(dirPath);
      return scriptFiles;

      async function fillInDir(dirPath: string) {
        for await (const entry of Deno.readDir(dirPath)) {
          if (entry.isDirectory) {
            await fillInDir(path.join(dirPath, entry.name));
          } else if (entry.isFile) {
            if (hasScriptExtension(entry.name)) {
              scriptFiles.push(path.join(dirPath, entry.name));
            }
          }
        }
      }
    }
  }
}
