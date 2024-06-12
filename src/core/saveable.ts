import { existsSync } from "fs";

import { readFile, writeFile } from "fs/promises";
import { out, time } from "@vivotech/out";
export class Saveable<Type = Iterable<[string, unknown]>> {
  filename = "data.json";
  data: Type | null = null;

  async saveData(data: Type) {
    if (JSON.stringify(data) === JSON.stringify(this.data)) {
      return;
    }

    const file = data;
    await writeFile(this.filename, JSON.stringify(file));
    this.data = file;
    this.announce(data);
  }

  announce(data: Type) {
    if (Array.isArray(data)) {
      time(this.constructor.name + " " + data.length + " loaded");
    }
  }

  async loadData() {
    let data: Type | null = null;

    if (existsSync(this.filename)) {
      const file = (await readFile(this.filename)).toString();

      if (file) {
        try {
          data = JSON.parse(file);
        } catch (error: unknown) {
          out(error as string);
        }
      }

      if (data) {
        this.data = data;
        this.announce(data);
      }
    }

    return data;
  }
}

export class SaveableMap<Type> extends Saveable {
  mapData = new Map<string, Type>();

  modifyData(ip: string, bulb?: Partial<Type>) {
    const exist = this.mapData.has(ip);

    if (!exist) {
      // wip("setup tuya api key " + ip);
    }

    if (JSON.stringify(bulb) === JSON.stringify(this.mapData.get(ip))) {
      return;
    }

    this.mapData.set(ip, {
      active: false,
      state: false,
      ...bulb,
    } as Type);

    this.saveData([...this.mapData.entries()]);
  }
}
