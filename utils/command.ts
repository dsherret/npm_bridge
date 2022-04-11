// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export async function runCommand(params: {
  cwd: string;
  cmd: string[];
}) {
  const p = Deno.run({
    cwd: params.cwd,
    cmd: getCmd(params.cmd),
    stderr: "piped",
    stdout: "piped",
  });

  const [status, stdout, stderr] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);
  p.close();

  if (!status.success) {
    throw new Error(
      `Error executing ${params.cmd[0]}: ${new TextDecoder().decode(stderr)}`,
    );
  }

  return new TextDecoder().decode(stdout);
}

export async function runCommandWithOutput(params: {
  cwd: string;
  cmd: string[];
}) {
  const p = Deno.run({
    cwd: params.cwd,
    cmd: getCmd(params.cmd),
    stderr: "inherit",
    stdout: "inherit",
  });

  const status = await p.status();
  p.close();

  if (!status.success) {
    throw new Error(
      `Error executing ${params.cmd[0]}. Code: ${status.code}`,
    );
  }
}

function getCmd(cmd: string[]) {
  if (Deno.build.os === "windows") {
    return ["cmd", "/c", ...cmd];
  } else {
    return cmd;
  }
}
