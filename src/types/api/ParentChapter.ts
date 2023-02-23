import type { Chapter } from "./Chapter";

export interface ParentChapter extends Chapter {
  childs: Chapter[];
}
