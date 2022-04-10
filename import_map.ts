// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { stripRelative } from "./utils/path.ts";

export class ImportMapBuilder {
  #imports: { [name: string]: string } = {};
  #noExtFilePaths: string[] = [];

  setImport(name: string, specifier: string) {
    this.#imports[name] = specifier;
  }

  addNoExtPaths(...paths: string[]) {
    this.#noExtFilePaths.push(...paths);
  }

  build() {
    const scopes: { [name: string]: string } = {};
    for (const file of this.#noExtFilePaths) {
      const normalizedFile = "./" + stripRelative(file.replace(/\\/g, "/"));
      const fileNoExt = normalizedFile.replace(
        /(\.d\.ts)?(\.[A-Za-z]+)?$/i,
        "",
      );
      scopes[fileNoExt] = normalizedFile;
    }

    return {
      imports: this.#imports,
      scopes: {
        ["./"]: scopes,
      },
    };
  }
}
