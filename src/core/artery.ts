import express, { Request, Response } from "express";
import { time } from "../common";
import { WebSocketServer } from "ws";
import { createServer } from "http";

export interface Artery {}
export class Artery {
  ex = express();
  server = createServer(this.ex);
  wss = new WebSocketServer({ clientTracking: false, noServer: true });

  constructor({ statics = [] }: { statics: string[] }) {
    this.server.on("upgrade", (request, socket, head) => {
      time("init user" + request.url);
      socket.on("error", this.onSocketError);
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit("connection", ws, request);
      });
    });

    this.#setupCors();
    this.#websockets();

    for (const path of statics) {
      this.ex.use(express.static(path));
    }
  }

  async handleRequest(
    callback: (params: Record<string, string>) => Promise<unknown>,
    req: Request,
    res: Response
  ) {
    const response = JSON.stringify(await callback(req.params));
    res.send(response);
  }

  async get(
    path: string,
    get: (params: Record<string, string>) => Promise<unknown>
  ) {
    this.ex.get(path, this.handleRequest.bind(this, await get));
  }

  async post(
    path: string,
    post: (params: Record<string, string>) => Promise<unknown>
  ) {
    this.ex.post(path, this.handleRequest.bind(this, await post));
  }

  async setupApp(port: number) {
    time(`app on ${port}`);
    this.server.listen(port);
  }

  onSocketError(err: Error) {
    console.error(err);
  }

  #websockets() {
    this.wss.on("connection", function (ws, request) {
      // const userId = request.session.userId;
      // map.set(userId, ws);

      ws.on("error", console.error);

      ws.on("message", function (message) {
        //
        // Here we can now use session parameters.
        //
        console.log(`Received message ${message}`);
      });

      ws.on("close", function () {
        // map.delete(userId);
      });
    });
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
}

/**
 * UPGRADE
 */

/*
  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    console.log("Session is parsed!");

    socket.removeListener("error", this.onSocketError);

    this.wss.handleUpgrade(request, socket, head,  (ws) => {
      this.wss.emit("connection", ws, request);
    });
  });
*/
