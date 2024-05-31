import express from "express";
import { time } from "../common";

export interface Organ {}
export class Organ {
  ex = express();

  constructor({ statics = [] }: { statics: string[] }) {
    this.#setupCors();

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

  get(path: string, get: (params: Record<string, string>) => unknown) {
    this.ex.get(path, (req, res) => {
      const response = JSON.stringify(get(req.params));
      res.send(response);
    });
  }

  post(path: string, post: (params: Record<string, string>) => void) {
    this.ex.post(path, (req, res) => {
      const response = JSON.stringify(post(req.params));
      res.send(response);
    });
  }

  async setupApp(port: number) {
    time(`app on ${port}`);
    this.ex.listen(port);
  }
}
