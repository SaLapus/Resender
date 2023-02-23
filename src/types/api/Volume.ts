import type { Annotation } from "./Annotation";
import type { Chapter } from "./Chapter";
import type { Image } from "./Image";
import type { Worker } from "./Worker";

export interface Volume {
  id: number;
  url: string;
  fullUrl?: string;
  type?: string;
  title?: string;
  shortName?: string;
  status?: string;
  covers?: Image[];
  annotation?: Annotation;
  staff?: Worker[];
  chapters?: Chapter[];
}
