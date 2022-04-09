// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { npmInstall } from "../lib.ts";
import { path } from "../deps.ts";

const outDir = path.join(
  path.dirname(path.fromFileUrl(import.meta.url)),
  "./npm_deps",
);

Deno.test("should create", async () => {
  await npmInstall({
    outDir,
    dependencies: {
      "code-block-writer": "^11.0.0",
    },
    devDependencies: {},
  });
});
