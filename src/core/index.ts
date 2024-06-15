import { time } from "@vivotech/out";
import { Artery } from "./artery";

export * from "./saveable";
export * from "./artery";
export * from "./status";

export function init(artery: Artery) {
  const port = process.argv[2];

  if (port) {
    artery.setupApp(+port);
  } else {
    time("Port is not provided");
  }
}
