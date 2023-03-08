import type EventEmitter from "events";
import type * as APITypes from "../../types/api";

import type { IJSONStorage } from "../db";

export declare interface Client extends EventEmitter {
  DB: IJSONStorage;
  on(
    eventName: "update",
    callback: (update: APITypes.VolumeUpdates.Content[]) => void
  ): this;
}
