export interface NpxArgs {
  commandName: string;
  commandArgs: string[];
  denoArgs: string[];
}

export function parseArgs(args: string[]): NpxArgs {
  // todo: this needs to handle deno cli flags
  const denoArgs = [];
  const commandArgs = [];
  let commandName: string | undefined;
  for (const arg of args) {
    if (commandName == null) {
      if (arg.startsWith("-")) {
        denoArgs.push(arg);
      } else {
        commandName = arg;
      }
    } else {
      commandArgs.push(arg);
    }
  }
  if (commandName == null) {
    throw new Error("Could not find argument in commands.");
  }

  if (!denoArgs.includes("--unstable")) {
    denoArgs.push("--unstable");
  }
  if (!denoArgs.includes("--no-check")) {
    denoArgs.push("--no-check");
  }
  if (!denoArgs.some((s) => s.startsWith("--allow-read"))) {
    denoArgs.push("--allow-read");
  }
  if (!denoArgs.some((s) => s.startsWith("--allow-env"))) {
    denoArgs.push("--allow-env");
  }

  return {
    commandName,
    commandArgs,
    denoArgs,
  };
}
