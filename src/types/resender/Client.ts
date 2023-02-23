import type EventEmitter from "events";

import type { IJSONStorage } from "../db";
import type { VolumeUpdates } from "../api";

export declare interface Client extends EventEmitter {
  DB: IJSONStorage;
  on(eventName: "update", callback: (update: VolumeUpdates.Content |  VolumeUpdates.Content[]) => void): this;
}
