import * as flags from "https://deno.land/std@0.132.0/flags/mod.ts";

export type Command =
  | HelpCommand
  | InitCommand
  | InstallCommand
  | InstallDepCommand
  | InstallDevDepCommand;

export interface HelpCommand {
  kind: "help";
}

export interface InitCommand {
  kind: "init";
}

export interface InstallCommand {
  kind: "install";
}

export interface InstallDepCommand {
  kind: "install-dep";
  name: string;
}

export interface InstallDevDepCommand {
  kind: "install-dev-dep";
  name: string;
}

export function parseArgs(rawArgs: string[]): Command {
  const args = flags.parse(rawArgs, {
    "boolean": true,
  });

  switch (args._[0]) {
    case "i":
    case "install": {
      if (typeof args._[1] === "string") {
        if (args["save-dev"] || args["D"] || args["dev"]) {
          return {
            kind: "install-dev-dep",
            name: args._[1],
          };
        } else {
          return {
            kind: "install-dep",
            name: args._[1],
          };
        }
      }
      return { kind: "install" };
    }
    case "init": {
      return { kind: "init" };
    }
    case null:
    case undefined:
      return { kind: "help" };
    default:
      if (args["h"] || args["help"]) {
        return { kind: "help" };
      }
      throw new Error(`Unknown subcommand: ${args._[0]}`);
  }
}
