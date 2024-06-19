import { time } from "@vivotech/out";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { ArteryStatus } from "./status";

export class Artery {
  ex = express();
  server = createServer(this.ex);
  wss = new WebSocketServer({ clientTracking: false, noServer: true });
  connected = new Map<string, WebSocket>();
  conduit = new EventEmitter();

  pkg = {
    name: "unknown artery",
    version: "x.x.x",
  };

  constructor({ statics = [] }: { statics: string[] }) {
    this.#loadPackageData();

    this.server.on("upgrade", (request, socket, head) => {
      socket.on("error", this.onSocketError);
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit("connection", ws, request);
      });
    });

    this.get<ArteryStatus>("/status", async () => {
      const { name, version } = this.pkg;

      return {
        uptime: process.uptime(),
        version,
        name,
      };
    });

    this.#setupCors();
    this.#websockets();

    for (const path of statics) {
      this.ex.use(express.static(path));
    }

    this.#welcomeLog();
  }

  #loadPackageData() {
    const pkg = JSON.parse(
      readFileSync(process.cwd() + "/package.json").toString()
    );

    this.pkg = { ...this.pkg, ...pkg };
  }

  #welcomeLog() {
    time(`${this.pkg.name} ${this.pkg.version}`);
  }

  async handleRequest(
    callback: (
      params: Record<string, string>,
      query: Request["query"]
    ) => Promise<unknown>,
    req: Request,
    res: Response
  ) {
    const response = JSON.stringify(await callback(req.params, req.query));

    res.send(response);
  }

  async get<Response = unknown>(
    path: string,
    get: (
      params: Record<string, string>,
      query: Request["query"]
    ) => Promise<Response>
  ) {
    this.ex.get(path, this.handleRequest.bind(this, await get));
  }

  async post(
    path: string,
    post: (
      params: Record<string, string>,
      query: Request["query"]
    ) => Promise<unknown>
  ) {
    this.ex.post(path, this.handleRequest.bind(this, await post));
  }

  async setupApp(port: number) {
    time(`${this.pkg.name ?? "app"} on ${port}`);
    this.server.listen(port);
  }

  onSocketError(err: Error) {
    console.error(err);
  }

  #websockets() {
    this.wss.on("connection", (ws, request) => {
      const uid = randomUUID();
      this.connected.set(uid, ws);
      // const userId = request.session.userId;
      // map.set(userId, ws);

      ws.on("error", console.error);

      ws.on("message", (message) => {
        //
        // Here we can now use session parameters.
        //
        this.conduit.emit("data", JSON.parse(message.toString()), ws);
      });

      ws.on("close", () => this.connected.delete(uid));
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
