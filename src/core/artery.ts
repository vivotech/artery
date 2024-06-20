import { time } from "@vivotech/out";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { ArteryList } from "../list";
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

  #lists = new Map<string, ArteryList>();

  constructor({
    statics = [],
    lists = {},
  }: {
    statics?: string[];
    lists?: {
      [signature: string]: typeof ArteryList;
    };
  }) {
    this.#loadPackageData();

    this.server.on("upgrade", (request, socket, head) => {
      socket.on("error", this.#onSocketError);
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

    this.#registerLists(lists);
    this.#welcomeLog();
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

  #registerLists(lists: { [signature: string]: typeof ArteryList }) {
    this.get("/lists", async () => [...this.#lists.keys()]);

    this.get("/list/all", async (params, query) => {
      const signature = query.signature;

      if (typeof signature !== "string") {
        return [];
      }

      return this.#lists.get(signature)?.all();
    });

    for (const [signature, List] of Object.entries(lists)) {
      this.registerList(signature, List);
    }
  }

  registerList(signature: string, List: typeof ArteryList) {
    this.#lists.set(signature, new List(signature, this));
  }

  async get<Response = unknown>(path: string, get: RequestFunc<Response>) {
    this.ex.get(path, this.handleRequest.bind(this, await get));
  }

  async post<Response = unknown>(path: string, post: RequestFunc<Response>) {
    this.ex.post(path, this.handleRequest.bind(this, await post));
  }

  async setupApp(port: number) {
    time(`[ARTERY] ${this.pkg.name ?? "app"} on http://127.0.0.1:${port}`);
    this.server.listen(port);
  }

  #loadPackageData() {
    const pkg = JSON.parse(
      readFileSync(process.cwd() + "/package.json").toString()
    );

    this.pkg = { ...this.pkg, ...pkg };
  }

  #welcomeLog() {
    time(`[ARTERY] ${this.pkg.name} ${this.pkg.version}`);
  }

  #onSocketError(err: Error) {
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

export type RequestFunc<Response = unknown> = (
  params: Record<string, string>,
  query: Request["query"]
) => Promise<Response>;

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
