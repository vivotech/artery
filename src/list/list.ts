import { Artery } from "../core";
import { yell } from "../core/conduit";

export interface ArteryListItem {
  id: string;
}

export type ArteryListResponse<Model extends ArteryListItem> =
  | ArteryListUpdateResponse<Model>
  | ArteryListRemoveResponse<Model>
  | ArteryListAllResponse<Model>;

export interface ArteryListRemoveResponse<Model extends ArteryListItem> {
  data: Model["id"][];
  type: "remove";
}

export interface ArteryListAllResponse<Model extends ArteryListItem> {
  data: Model[];
  type: "all";
}

export interface ArteryListUpdateResponse<Model extends ArteryListItem> {
  type: "update";
  data: Model[];
}

export class ArteryList<
  Model extends ArteryListItem = ArteryListItem,
  Art extends Artery = Artery
> {
  constructor(public signature: string, private artery: Art) {}

  #data = new Map<string, Model>();

  get(id: string) {
    return this.#data.get(id);
  }

  all() {
    return [...this.#data.values()];
  }

  // on init Model can be without id
  init(values: (Model | Omit<Model, "id">)[]) {
    this.#data.clear();

    const data = [];

    for (const value of values) {
      const id: string =
        "id" in value ? value.id : Math.random().toString(36).substring(2, 15);
      const val = { ...value, id } as Model;

      this.#data.set(id, val);
      data.push(val);
    }

    const response: ArteryListAllResponse<Model> = {
      type: "all",
      data,
    };

    yell([...this.artery.connected.values()], {
      signature: this.signature,
      message: response,
    });
  }

  remove(ids: string[]) {
    const removed = [];

    for (const id of ids) {
      this.#data.delete(id);
      removed.push(id);
    }

    const response: ArteryListResponse<Model> = {
      type: "remove",
      data: removed,
    };

    yell([...this.artery.connected.values()], {
      signature: this.signature,
      message: response,
    });
  }

  clear() {
    this.#data.clear();

    const response: ArteryListResponse<Model> = {
      type: "all",
      data: [],
    };

    yell([...this.artery.connected.values()], {
      signature: this.signature,
      message: response,
    });
  }

  get size() {
    return this.#data.size;
  }

  update(values: Model[]) {
    const update = [];

    for (const value of values) {
      const item = { ...this.#data.get(value.id), ...value };

      if (!item.id) {
        item.id = Math.random().toString(36).substring(2, 15);
      }

      this.#data.set(value.id, item);
      update.push(item);
    }

    const response: ArteryListResponse<Model> = {
      type: "update",
      data: update,
    };

    yell([...this.artery.connected.values()], {
      signature: this.signature,
      message: response,
    });
  }

  broadcast(response: ArteryListResponse<Model>) {
    yell([...this.artery.connected.values()], {
      signature: this.signature,
      message: response,
    });
  }
}
