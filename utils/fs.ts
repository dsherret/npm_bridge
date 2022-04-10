// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { path } from "../deps.ts";
import { getScriptExtension, JS_SCRIPT_EXTENSIONS } from "./path.ts";

export async function* readDirs(dirPath: string) {
  for await (const entry of Deno.readDir(dirPath)) {
    if (entry.isDirectory) {
      yield path.join(dirPath, entry.name);
    }
  }
}

export async function pathExists(fileOrDirPath: string) {
  try {
    await Deno.stat(fileOrDirPath);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

export async function getJsScriptInDirWithPrefix(
  dirPath: string,
  fileNameNoExt: string,
) {
  for await (
    const { fileName, ext } of getAllScriptsAndTsFilesInDirWithPrefix(
      dirPath,
      fileNameNoExt,
    )
  ) {
    if (JS_SCRIPT_EXTENSIONS.includes(ext)) {
      return fileName;
    }
  }
  return undefined;
}

export async function* getAllScriptsAndTsFilesInDirWithPrefix(
  dirPath: string,
  fileNameNoExt: string,
) {
  // todo: look at what npm does
  const lowerCaseFileNameNoExt = fileNameNoExt.toLowerCase(); // case insensitive
  for await (const entry of Deno.readDir(dirPath)) {
    if (entry.isFile) {
      const ext = getScriptExtension(entry.name);
      if (ext != null) {
        const nameNoExt = entry.name.slice(0, entry.name.length - ext.length);
        if (nameNoExt.toLowerCase() === lowerCaseFileNameNoExt) {
          yield {
            fileName: entry.name,
            ext,
          };
        }
      }
    }
  }
}
