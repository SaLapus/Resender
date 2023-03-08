import { API } from "./../api";
import Chapters from "./chapters";

import type { Chapter, ParentChapter, Worker } from "./../../types/api";

interface UpdateInfoArgs {
  projectID: number;
  volumeID: number;
  dateFrom: Date;
}

export interface UpdateInfo {
  update: string;
  coverBuffer: Buffer | undefined;
  info: {
    projectID: number;
    volumeID: number;
    dateFrom: Date;

    title: string;
    chapters: string;
    doneStatus: string;
    url: string;
    annotation: string;
    staff: string;
  };
}

export default async function getTextUpdate({
  projectID,
  volumeID,
  dateFrom,
}: UpdateInfoArgs): Promise<UpdateInfo> {
  if (!(projectID && volumeID && dateFrom))
    throw `MISSING INFO IN project: ${projectID} volume: ${volumeID} dateFrom:${dateFrom}`;
  const volume = await API.getVolume(volumeID);
  const project = await API.getProject(projectID);

  const title: string = getTitle(volume.title, project.title);
  const chapters: string = getChapters(volume.chapters, dateFrom);
  const doneStatus: string = getStatus(volume.status);
  const url: string = getURL(volume.url);
  const annotation: string = getAnnotation(volume.annotation?.text, project.shortDescription);
  const staff: string = getStaff(volume.staff);
  const cover = await getCover(volume.covers?.shift()?.url);

  const head = [title, chapters].filter((e) => !!e).join(" - ");
  const update = [head, doneStatus, url, annotation, staff]
    .filter((paragraph) => !!paragraph)
    .join("\n\n");

  return {
    update,
    coverBuffer: cover,
    info: {
      projectID,
      volumeID,
      dateFrom,
      title,
      chapters,
      doneStatus,
      url,
      annotation,
      staff,
    },
  };
}

function getTitle(volumeTitle: string | undefined, projectTitle: string): string {
  const title = volumeTitle ? volumeTitle : projectTitle;
  return `**${title}**`;
}

function getChapters(chapters: Chapter[] | undefined, date: Date): string {
  let sortedChapters: ParentChapter[] = [];
  if (chapters && date) sortedChapters = sortedChapters.concat(Chapters(chapters, date));

  sortedChapters.splice(1, sortedChapters.length - 2);

  return sortedChapters.map((ch) => ch.title).join(" - ");
}

function getStatus(status: string | undefined): string {
  if (status && status.search(/done|decor/) >= 0)
    return "**ЗАВЕРШЕНО**\n" + `<@&${process.env["ROLE_TO_PING_ID"]}>`;
  return "";
}

function getURL(url: string) {
  return `:link: [Читать](https://${url})`;
}

function getAnnotation(volumeAnnot: string | undefined, projectAnnot: string | undefined): string {
  if (volumeAnnot) return volumeAnnot.replace(/<\/?.+?>/g, "").trim();
  else if (projectAnnot) {
    return projectAnnot;
  }
  return "";
}

function getStaff(staff: Worker[] | undefined): string {
  if (staff) {
    const staffMap: Map<string, string[]> = new Map();

    for (const member of staff) {
      if (!member.activityName) continue;

      if (staffMap.has(member.activityName))
        staffMap.get(member.activityName)?.push(member.nickname.trim());
      else staffMap.set(member.activityName, [member.nickname]);
    }

    return Array.from(staffMap.entries())
      .map(([role, workers]) => `${role}: *${workers.join("*, *")}*`)
      .join("\n");
  }
  return "";
}

async function getCover(url: string | undefined): Promise<Buffer | undefined> {
  if (url) return await API.getCoverStream(url);
  return;
}
