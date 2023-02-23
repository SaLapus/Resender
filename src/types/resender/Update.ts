import type { ParentChapter } from "../api";

export interface Update {
  meta: MetaInfo;

  title: string;
  chapters?: ParentChapter[];
  annotation: string;
  staff: {
    [name: string]: string[];
  };
  doneStatus: boolean;

  updateURL: string;
  coverURL: string;

  getCover: () => Promise<Buffer>;
}

interface MetaInfo {
  projectID: number;
  volumeID: number;
}
