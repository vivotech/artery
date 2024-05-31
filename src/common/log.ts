export function log(...texts: string[]) {
  console.log(...texts);
}

export function wip(text: string) {
  log("WIP", "!!!", text);
}
export function time(text: string) {
  const date = new Date();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const h = hours < 10 ? "0" + hours : hours;
  const m = minutes < 10 ? "0" + minutes : minutes;
  const s = seconds < 10 ? "0" + seconds : seconds;

  log(`[${h}:${m}:${s}]`, text);
}
