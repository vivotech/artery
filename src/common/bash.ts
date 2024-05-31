import { spawn } from "child_process";
import { EventEmitter } from "events";

export function bash(command: string, args: string[]) {
  const emitter = new EventEmitter();

  try {
    const bash = spawn(command, args, {});

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
