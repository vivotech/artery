import { terminal } from "terminal-kit";

export { terminal };

export function log(
  texts: string[] | string,
  options?: { type: "info" | "warn" | "error" }
) {
  const textWithSpaces = (Array.isArray(texts) ? texts : [texts]).join(" ");

  switch (options?.type) {
    case "warn":
      terminal.yellow(textWithSpaces, "\n");
      break;
    case "error":
      terminal.red(textWithSpaces, "\n");
      break;
    default:
      terminal(textWithSpaces, "\n");
  }
}

export function wip(text: string) {
  log(["WIP", "!!!", text], { type: "warn" });
}
export function time(
  texts: string[] | string,
  options?: { type: "info" | "warn" | "error" }
) {
  const date = new Date();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const h = hours < 10 ? "0" + hours : hours;
  const m = minutes < 10 ? "0" + minutes : minutes;
  const s = seconds < 10 ? "0" + seconds : seconds;

  log(
    [`[${h}:${m}:${s}]`, ...(Array.isArray(texts) ? texts : [texts])],
    options
  );
}
