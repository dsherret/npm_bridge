// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

// very basic... should be improved to handle jsonc and not change the formatting of the file

export class DenoJson {
  #data: any;

  constructor() {
    this.#data = JSON.parse(getText());
  }

  addImportMap(importMap: string) {
    if (this.#data.importMap != null && this.#data.importMap !== importMap) {
      console.error(
        `Could not specifiy '${importMap}' for the import map in deno.json because there was already an entry for '${this.#data.importMap}'. Please update it manually.`,
      );
    } else {
      this.#data.importMap = importMap;
    }
  }

  async save() {
    Deno.writeTextFile("deno.json", JSON.stringify(this.#data, null, 2) + "\n");
  }
}

function getText() {
  try {
    return Deno.readTextFileSync("deno.json");
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return "{}";
    } else {
      throw err;
    }
  }
}
