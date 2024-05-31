export * from "./saveable";

import express from "express";
import { time } from "../common";

export interface Organ {}
export class Organ {
  ex = express();

  constructor({ statics = [] }: { statics: string[] }) {
    for (const path of statics) {
      this.ex.use(express.static(path));
    }
  }

  #setupCors() {
    this.ex.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );

      next();
    });
  }

  async setupApp(port: number) {
    time(`app on ${port}`);
    this.ex.listen(port);
  }
}
