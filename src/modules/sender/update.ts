import { API } from "./../api";
import Chapters from "./chapters";

import type { Annotation, ParentChapter, Volume, Worker } from "./../../types/api";
import type * as ReSender from "./../../types/resender";

export default class UpdateInfoLoader {
  info: {
    projectID: number;
    volumeID: number;
  } = { projectID: 0, volumeID: 0 }; //заглушка

  lastUpdateDate: Date = new Date(0);

  constructor(
    { projectId, volumeId }: { projectId: number; volumeId: number },
    TimeOfLastPost: Date
  ) {
    if (!projectId || !volumeId || !TimeOfLastPost)
      throw new Error(`NO DATA FOR UPDATE_CLIENT\nPID: ${projectId} VID: ${volumeId}`);

    this.info = {
      projectID: projectId,
      volumeID: volumeId,
    };

    this.lastUpdateDate = TimeOfLastPost;
  }

  async createUpdate(): Promise<ReSender.Update> {
    const update = new Update(this.info);

    const volume = await this.loadVolumeInfo();

    update.setTitle(volume.title);

    await update.setAnnotation(volume.annotation, this.info.projectID);

    update.setStaff(volume.staff);
    update.setStatus(volume.status);

    update.setUpdateURL(volume.fullUrl);
    update.setCoverURL(volume.covers?.shift()?.url);

    update.chapters = new Chapters(volume.chapters).filter(this.lastUpdateDate.getTime());

    return update;
  }

  private async loadVolumeInfo(): Promise<Volume> {
    return await API.getVolume(this.info.volumeID);
  }
}

class Update implements ReSender.Update {
  meta = { projectID: 0, volumeID: 0 }; //заглушка

  title = "";
  chapters?: ParentChapter[] = undefined;
  annotation = "";
  staff: {
    [name: string]: string[];
  } = {};
  doneStatus = false;

  updateURL = "";
  coverURL = "";

  constructor({ projectID, volumeID }: { projectID: number; volumeID: number }) {
    this.meta = { projectID, volumeID };
  }

  setTitle(t: string | undefined) {
    this.title = t ? t.trim() : "";
  }

  async setAnnotation(annotation: Annotation | undefined, projectId: number) {
    if (annotation && annotation.text) {
      const text = annotation.text.replace(/<\/?.+?>/g, "").trim();
      if (text) {
        this.annotation = text;
        return;
      }
    }
    this.annotation = (await API.getProject(projectId))?.shortDescription ?? "";
  }

  setStaff(staff: Worker[] | undefined) {
    if (staff) {
      const staffMap: Map<string, string[]> = new Map();

      for (const member of staff) {
        if (!member.activityName) continue;

        if (staffMap.has(member.activityName))
          staffMap.get(member.activityName)?.push(member.nickname.trim());
        else staffMap.set(member.activityName, [member.nickname]);
      }

      for (const [activity, members] of staffMap)
        Object.assign(this.staff, { [activity]: members });
    }
  }

  setStatus(status: string | undefined) {
    if (status) status.search(/done|decor/) >= 0 && (this.doneStatus = true);
  }

  setUpdateURL(url: string | undefined) {
    this.updateURL = `https://${url || "ruranobe.ru/r/"}`;
  }

  setCoverURL(url: string | undefined) {
    if (url) this.coverURL = url;
  }

  /////////////////////////////////////////////////////
  async getCover(): Promise<Buffer> {
    return API.getCoverStream(this.coverURL);
  }

  toObject(): ReSender.Update {
    const o = {};
    for (const [key, value] of Object.entries(this)) {
      Object.assign(o, { [key]: value });
    }
    return o as ReSender.Update;
  }

  toString() {
    const parsedChapters = this.chapters
      ?.map((ch) => ch.title)
      .filter((_, index, array) => index === 0 || index === array.length - 1)
      .join(" - ");
    const staff = Object.entries(this.staff)
      .map(([role, workers]) => `${role}: *${workers.join("*, *")}*`)
      .join("\n");

    return `**${this.title}** - ${parsedChapters}
${
  this.doneStatus
    ? `
**ЗАВЕРШЕНО**
<@&${process.env["ROLE_TO_PING_ID"]}>
`
    : ""
}
:link: [Читать](${this.updateURL})

${this.annotation}

${staff}`;
  }
}
