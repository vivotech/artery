import { spawn } from "child_process";
import { EventEmitter } from "events";

export function bash(command: string, args: string[]) {
  const bash = spawn(command, args, {});
  const emitter = new EventEmitter();

  bash.stdout.on("data", (data) => {
    emitter.emit("data", data.toString().trim());
  });

  bash.stderr.on("data", (data) => {
    emitter.emit("error", data.toString().trim());
  });

  bash.on("close", (code) => {
    emitter.emit("close", code);
  });

  return emitter;
}
