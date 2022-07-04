// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { npmInstall } from "../lib.ts";
import { path } from "../deps.ts";

const testDir = path.join(
  path.dirname(path.fromFileUrl(import.meta.url)),
  "./output",
);

Deno.test("should create", async () => {
  Deno.mkdirSync(testDir, { recursive: true });
  Deno.chdir(testDir);
  await npmInstall({
    outDir: path.join(testDir, "./npm_deps"),
    dependencies: {
      "code-block-writer": "^11.0.1",
    },
    devDependencies: {},
  });
});
