import { WebSocket } from "ws";

export interface ConduitEvent {
  signature: string;
  message: unknown;
}

export function direct<Data extends ConduitEvent = ConduitEvent>(
  client: WebSocket,
  data: Data
) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
}

export function yell<Data extends ConduitEvent = ConduitEvent>(
  connected: WebSocket[],
  data: Data
) {
  connected.forEach((client) => direct(client, data));
}

export function recive<Data extends ConduitEvent = ConduitEvent>(
  conduit: WebSocket,
  callback: (data: Data, socket: WebSocket) => void
) {
  conduit.on("data", callback);
}
