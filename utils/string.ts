// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export function stripRelative(specifier: string) {
  if (specifier.startsWith("./")) {
    return specifier.substring(2);
  } else if (specifier.startsWith("/")) {
    return specifier.substring(1);
  } else {
    return specifier;
  }
}
