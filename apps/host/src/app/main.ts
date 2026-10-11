import { CliView } from "../adapters/cli/index.ts";
import { run } from "./compose.ts";

const waitForStop = () =>
  new Promise<void>((resolve) => {
    for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, resolve);
  });

try {
  process.exitCode = await run({
    argv: process.argv.slice(2),
    env: process.env,
    cwd: process.env.INIT_CWD ?? process.cwd(),
    terminal: {
      input: process.stdin,
      output: process.stdout,
      error: process.stderr,
      interactive: !!process.stdin.isTTY,
    },
    waitForStop,
  });
} catch (error) {
  new CliView(process.stdout, process.stderr).error(error);
  process.exitCode = 1;
}
