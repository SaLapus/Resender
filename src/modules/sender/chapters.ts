import type * as APITypes from "../../types/api";

export default function Chapters(
  chapters: APITypes.Chapter[],
  dateToCheck: Date
): APITypes.ParentChapter[] {
  const relChaps = filter(chapters, dateToCheck);

  const sortedChaps = sortChapters(relChaps);

  return sortedChaps;
}

function filter(chapters: APITypes.Chapter[], dateToCheck: Date): APITypes.Chapter[] {
  const chs = chapters.filter((ch) => ch.publishDate !== null);

  if (chs.length === 0) return chs;

  const relevantChs = chs.filter((ch) => new Date(ch.publishDate) >= dateToCheck);

  return relevantChs;
}

function sortChapters(chapters: APITypes.Chapter[]) {
  const temp: Map<number, APITypes.ParentChapter> = new Map();

  chapters.forEach((chapter) => {
    if (!chapter.parentChapterId) temp.set(chapter.id, Object.assign({ childs: [] }, chapter));
  });

  chapters.forEach((chapter) => {
    if (chapter.parentChapterId) {
      const parent = temp.get(chapter.parentChapterId);
      parent?.childs.push(chapter);
    }
  });

  return Array.from(temp.values());
}
