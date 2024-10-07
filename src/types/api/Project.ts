import { Image } from "./Image";

export interface Project {
  id: number;
  fullUrl?: string;
  title: string;
  covers?: Image[];
  shortDescription?: string;
}
