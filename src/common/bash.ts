import { spawn } from "child_process";
import { EventEmitter } from "events";

export interface BashOptions {
  user?: string;
  cwd?: string;
}

export async function bashAsync(
  args: string[] = [],
  options: BashOptions = {}
) {
  return new Promise((res, rej) => {
    let response = "";

    bash(args[0], args.slice(1), options)
      .on("data", (data) => (response += data))
      .on("error", (error) => rej(error))
      .on("close", (code) => res(response));
  });
}

export function bash(
  command: string,
  args: string[],
  { cwd, user }: BashOptions = {}
) {
  const emitter = new EventEmitter();

  try {
    const bash = spawn("sudo", ["-u", user ?? "dev", command, ...args], {
      stdio: "pipe",
      shell: true,
      cwd,
    });

    bash.stdout.on("data", (data) =>
      emitter.emit("data", data.toString().trim())
    );

    bash.stderr.on("data", (data) =>
      emitter.emit("error", data.toString().trim())
    );
    bash.on("error", (error) => emitter.emit("error", error));
    bash.on("close", (code) => emitter.emit("close", code));
  } catch (error) {
    emitter.emit("error", error);
  }

  return emitter;
}
