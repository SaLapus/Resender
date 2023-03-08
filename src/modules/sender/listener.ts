import EventEmitter from "events";

import { API } from "../api";

import getDB from "../db";

import type * as APITypes from "../../types/api";
import type { IJSONStorage } from "../../types/db";
import type * as ReSender from "../../types/resender";

export default class UpdatesClient extends EventEmitter implements ReSender.Client {
  DB: IJSONStorage;

  private IntervalID?: NodeJS.Timeout;

  constructor() {
    super();

    this.DB = getDB();
  }

  async getLastUpdate(): Promise<void> {
    const u = await API.getUpdate(1);

    if (u) {
      this.emit("update", [u]);
    }
  }

  shedule(): void {
    const timeout = new Date(0).setUTCHours(0, 5) - (Date.now() % new Date(0).setUTCHours(0, 5));

    console.log("Start at ", new Date(new Date().getTime() + timeout).toString());

    setTimeout(() => {
      this.checkUpdates();

      this.IntervalID = setInterval(() => {
        setTimeout(() => this.checkUpdates(), 30 * 1000); // Задержка для избежания проверки до релиза
      }, 5 * 60 * 1000);
    }, timeout);
  }

  async checkUpdates(): Promise<void> {
    const updates = await this.getAllUpdates();

    if (updates.length === 0) {
      return;
    }

    const titles: Map<string, APITypes.VolumeUpdates.Content> = new Map();

    for (const u of updates) titles.set(`${u.projectId}_${u.volumeId}`, u);

    const sortedUpdates = [...titles.values()].sort(
      (t1, t2) => new Date(t1.showTime).getTime() - new Date(t2.showTime).getTime()
    );

    this.emit("update", sortedUpdates);
  }

  stop(): void {
    try {
      if (!this.IntervalID) throw new Error("UPDATESCLIENT: NO SUCH INTERVAL ID");
      clearInterval(this.IntervalID);
    } catch (e) {
      console.error(e);
    }
  }

  private async getAllUpdates(number = 1): Promise<APITypes.VolumeUpdates.Content[]> {
    const updates: APITypes.VolumeUpdates.Content[] = [];
    let relevance = false;
    do {
      const update = await API.getUpdate(number++);

      if (!update) throw new Error("INDEX_UPDATES_ERROR: Empty Update");

      relevance = this.checkRelevance(update);

      if (relevance) updates.push(update);
    } while (relevance);

    updates.forEach((u) => console.log("UPDATE OF: ", u.title, " at ", u.showTime));

    return updates;
  }

  private checkRelevance(update: APITypes.VolumeUpdates.Content): boolean {
    const time = this.DB.getTime();

    return time < new Date(update.showTime);
  }
}
