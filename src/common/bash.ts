import { spawn } from "child_process";
import { EventEmitter } from "events";

export async function bashAsync(
  command: string,
  args: string[] = [],
  options: { cwd?: string; user?: string } = {}
) {
  return new Promise((res, rej) => {
    let response = "";

    bash(command, args, options)
      .on("data", (data) => (response += data))
      .on("error", (error) => rej(error))
      .on("close", (code) => res(response));
  });
}

export function bash(
  command: string,
  args: string[],
  { cwd, user }: { cwd?: string; user?: string } = {}
) {
  const emitter = new EventEmitter();

  try {
    const bash = spawn("sudo", ["-u", user ?? "dev", command, ...args], {
      shell: true,
      cwd,
    });

    bash.stdout.on("data", (data) => {
      emitter.emit("data", data.toString().trim());
    });

    bash.stderr.on("data", (data) => {
      emitter.emit("error", data.toString().trim());
    });

    bash.on("error", (error) => {
      emitter.emit("error", error);
    });

    bash.on("close", (code) => {
      emitter.emit("close", code);
    });
  } catch (error) {
    emitter.emit("error", error);
  }

  return emitter;
}
