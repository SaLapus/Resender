export interface Chapter {
  title?: string;
  id: number;
  parentChapterId?: number | null;
  volumeId: number;
  publishDate: string;
}
