// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { path } from "../deps.ts";

export function stripRelative(specifier: string) {
  if (specifier.startsWith("./")) {
    return specifier.substring(2);
  } else if (specifier.startsWith("/")) {
    return specifier.substring(1);
  } else {
    return specifier;
  }
}

export const JS_SCRIPT_EXTENSIONS = [
  // ensure lowercase
  ".js",
  ".cjs",
  ".mjs",
];

export const TS_SCRIPT_EXTENSIONS = [
  // ensure lowercase
  ".ts",
  ".cts",
  ".mts",
];

export function hasScriptExtension(filePath: string) {
  return getScriptExtension(filePath) != null;
}

export function getScriptExtension(filePath: string) {
  const lowercasePath = filePath.toLowerCase();
  if (lowercasePath.endsWith(".d.ts")) {
    return ".d.ts";
  }
  const ext = path.extname(filePath).toLowerCase();
  if (
    JS_SCRIPT_EXTENSIONS.includes(ext) ||
    TS_SCRIPT_EXTENSIONS.includes(ext)
  ) {
    return ext;
  } else {
    return undefined;
  }
}
