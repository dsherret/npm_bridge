// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { path } from "../deps.ts";

export async function* readDirs(dirPath: string) {
  for await (const entry of Deno.readDir(dirPath)) {
    if (entry.isDirectory) {
      yield path.join(dirPath, entry.name);
    }
  }
}
