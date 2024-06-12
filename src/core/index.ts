import { time } from "@vivotech/out";
import { isNumberObject } from "util/types";
import { Artery } from "./artery";

export * from "./saveable";
export * from "./artery";

export function init(artery: Artery) {
  const port = process.argv[2];

  if (isNumberObject(port)) {
    artery.setupApp(Number(port));
  } else {
    time("Port is not provided");
  }
}
