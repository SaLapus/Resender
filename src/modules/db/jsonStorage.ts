import fs from "fs";
import path from "path";

import type { IJSONStorage } from "../../types/db/IJSONStorage";

// Асинхронная работа с файлами, кроме конструктора
class JSONStorage implements IJSONStorage {
  private time: Date = new Date();

  constructor() {
    let storageStr = "";
    try {
      storageStr = fs.readFileSync(path.join(process.cwd(), "./assets/db/storage.json"), {
        encoding: "utf-8",
      });

      const { time } = JSON.parse(storageStr);

      this.time = new Date(parseInt(time, 10));
    } catch (e) {
      this.time = new Date();
      console.error(`NO FILE STORAGE. NEW COUNT AT ${this.getTime()?.toUTCString()}`);
    }
  }

  setTime(time: Date) {
    this.time = time;

    const data = JSON.stringify({ time: this.time.getTime() });
    fs.writeFile(path.join(process.cwd(), "./assets/db/storage.json"), data, (err) => {
      console.error(err);
    });
  }

  getTime(): Date {
    return this.time;
  }
}

export default ((): (() => JSONStorage) => {
  const STORAGE = new JSONStorage();

  return () => STORAGE;
})();
