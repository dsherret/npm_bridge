import { path } from "./deps.ts";
import { pathExists } from "./utils/fs.ts";
import { runCommandWithOutput } from "./utils/command.ts";
import { parseArgs } from "./npx/args.ts";

const args = parseArgs(Deno.args);
const binPath = path.resolve("./npm_deps/.bin");
const commandPath = path.join(binPath, args.commandName + ".js");

if (!(await pathExists(commandPath))) {
  throw new Error(`Unknown command: ${args.commandName}`);
}

await runCommandWithOutput({
  cwd: Deno.cwd(),
  cmd: ["deno", "run", ...args.denoArgs, commandPath, ...args.commandArgs],
});
