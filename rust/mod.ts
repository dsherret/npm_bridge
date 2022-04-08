import * as generated from "./lib/rust.generated.js";

export interface CjsAnalysis {
  exports: string[];
  reexports: string[];
}

export function analyzeCjsExports(fileText: string): CjsAnalysis {
  return generated.analyzeCjsExports(fileText);
}
