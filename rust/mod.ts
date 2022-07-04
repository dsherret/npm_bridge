import { instantiate } from "./lib/rust.generated.js";

export interface CjsAnalysis {
  exports: string[];
  reexports: string[];
}

export async function analyzeCjsExports(
  fileText: string,
): Promise<CjsAnalysis> {
  const { analyzeCjsExports } = await instantiate();
  return analyzeCjsExports(fileText);
}
