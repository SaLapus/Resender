import * as fs from "fs/promises";
import path from "path";
import { inspect } from "util";

import needle from "needle";

import type * as APITypes from "../../types/api";

// Методы API должны либо возвращать данные, либо падать с ошибкой, которая перехватывается на самом верху приложения
// Потому что нужен либо полный пост, либо ничего

export async function getProject(id: number): Promise<APITypes.Project> {
  if (!id) {
    console.error("getProject: NO PROJECT ID");

    throw new Error();
  }

  try {
    const responce = await needle(
      "post",
      `${process.env["HOST_VOLUME"]}/api/site/v2/graphql`,
      {
        operationName: "Project",
        variables: { id },
        query: await getQuery("project"),
      },
      {
        content_type: "application/json",
        timeout: 20000,
      }
    );

    if (responce.errored) throw responce.errored;
    if (responce.statusCode && !(200 <= responce.statusCode && responce.statusCode < 300))
      throw `STATUS: ${responce.statusCode}`;

    return responce.body.data.project;
  } catch (error) {
    console.error(`PROJECT REQUEST`);
    console.error(`ID: ${id}`);

    console.error(error);

    throw new Error();
  }
}

export async function getUpdate(offset = 1): Promise<APITypes.VolumeUpdates.Content> {
  if (offset && offset > 50) {
    console.error("getUpdate: Too may requests");

    throw new Error();
  }

  try {
    const responce = await needle(
      "post",
      `${process.env["HOST_VOLUME"]}/api/site/v2/graphql`,
      {
        operationName: "VolumeUpdates",
        variables: { number: offset },
        query: await getQuery("volumeUpdates"),
      },
      {
        content_type: "application/json",
        timeout: 20000,
      }
    );

    if (responce.errored) throw responce.errored;
    if (responce.statusCode && !(200 <= responce.statusCode && responce.statusCode < 300))
      throw `STATUS: ${responce.statusCode}\n RESPONCE: ${inspect(responce, false, 3)}`;

    if (!responce.body.data.volumeUpdates?.content) throw "NO UPDATES CONTENT";

    return responce.body.data.volumeUpdates?.content.shift();
  } catch (error) {
    console.error(`UPDATE OFFSET: ${offset}`);

    console.error(error);

    throw new Error();
  }
}

export async function getVolume(id: number): Promise<APITypes.Volume> {
  if (!id) {
    console.error("getVolume: NO VOLUME ID");

    throw new Error();
  }

  try {
    const responce = await needle(
      "post",
      `${process.env["HOST_VOLUME"]}/api/site/v2/graphql`,
      {
        operationName: "Volume",
        variables: { id },
        query: await getQuery("volume"),
      },
      {
        content_type: "application/json",
        timeout: 20000,
      }
    );

    if (responce.errored) throw responce.errored;
    if (responce.statusCode && !(200 <= responce.statusCode && responce.statusCode < 300))
      throw `STATUS: ${responce.statusCode}`;

    return responce.body.data.volume;
  } catch (error) {
    console.error(`VOLUME REQUEST`);
    console.error(`ID: ${id}`);

    console.error(error);

    throw new Error();
  }
}

export async function getCoverStream(path: string): Promise<Buffer> {
  if (!path) {
    console.error("SL API GET COVER ERROR: NO PATH");

    throw new Error();
  }

  try {
    const responce = await needle("get", `${process.env["HOST_IMAGE"]}${path}`);

    if (responce.errored) throw responce.errored;
    if (responce.statusCode && !(200 <= responce.statusCode && responce.statusCode < 300))
      throw `STATUS: ${responce.statusCode}`;

    return responce.body;
  } catch (error) {
    console.error(`IMAGE REQUEST`);
    console.error("IMG_PATH: ", path);

    console.error(error);

    throw new Error();
  }
}

async function getQuery(type: string): Promise<string> {
  const filename = path.join(process.cwd(), "./assets/querys", `${type}.txt`);

  const querys = await fs.readdir(path.join(process.cwd(), "./assets/querys"));

  if (querys.some((f) => f === `${type}.txt`))
    return fs.readFile(filename, {
      encoding: "utf-8",
    });

  throw new Error(`getQuery: No such type: ${type}`);
}
