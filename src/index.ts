import * as Discord from "discord.js";
import { Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

import { exec } from "node:child_process";

dotenv.config();

import type * as APITypes from "./types/api";
import type { IJSONStorage } from "./types/db";

import getDB from "./modules/db";

import Listener from "./modules/sender/listener";
import type { UpdateInfo } from "./modules/sender/update";
import getTextUpdate from "./modules/sender/update";

const hook: Discord.WebhookClient = new Discord.WebhookClient({
  id:
    (process.env["NODE_ENV"] as string) === "production"
      ? (process.env["HOOK_RURA_ID"] as string)
      : (process.env["HOOK_CAPTAINHOOK_ID"] as string),
  token:
    (process.env["NODE_ENV"] as string) === "production"
      ? (process.env["HOOK_RURA_TOKEN"] as string)
      : (process.env["HOOK_CAPTAINHOOK_TOKEN"] as string),
});

const DB: IJSONStorage = getDB();
const UpdatesListener = new Listener();

UpdatesListener.on("update", updateHandler);
UpdatesListener.shedule();

async function updateHandler(updates: APITypes.VolumeUpdates.Content[]): Promise<void> {
  for (const u of updates) {
    if (!u) continue;

    const dateFrom = DB.getTime();

    if (!dateFrom) throw new Error("SL ERROR: BAD TIME --- DROP UPDATE");

    const messageContent = await getTextUpdate({
      projectID: u.projectId,
      volumeID: u.volumeId,
      dateFrom,
    });

    const message = await sendUpdate(messageContent);

    editMessage(message, messageContent);

    DB.setTime(new Date(u.showTime));
  }
}

async function sendUpdate(title: UpdateInfo): Promise<Discord.APIMessage> {
  const { update, coverBuffer } = title;

  const message = {
    content: update,
    allowedMentions: {
      roles: [process.env["ROLE_TO_PING_ID"] as string],
    },
  };
  if (coverBuffer) Object.assign(message, { files: [coverBuffer] });

  console.log("SENDING " + title.info.title);

  return await hook.send(message);
}

function editMessage(message: Discord.APIMessage, updateInfo: UpdateInfo) {
  const interval = setInterval(async () => {
    const { update } = await getTextUpdate({
      projectID: updateInfo.info.projectID,
      volumeID: updateInfo.info.volumeID,
      dateFrom: updateInfo.info.dateFrom,
    });

    await hook.editMessage(message as unknown as Discord.Message, {
      content: update,
      allowedMentions: {
        roles: [process.env["ROLE_TO_PING_ID"] as string],
      },
    });
  }, 15 * 60 * 1000);

  setTimeout(() => clearInterval(interval), new Date(0).setHours(4, 1));
}

const RuRaColor = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,

    GatewayIntentBits.MessageContent,
  ],
});

RuRaColor.on(Events.ClientReady, () => {
  let flag = false;
  exec('git log -1 --pretty=format:"%H - %an, %ad"', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    }
    if (!flag && stdout) {
      console.log("START RESENDER V.: " + stdout);

      process.env["COMMIT_INFO"] = stdout;
      flag = true;
    }
    if (stderr) {
      console.error(stderr);
    }
  });
});

RuRaColor.on(Events.MessageCreate, async (message: Discord.Message) => {
  if (message.channel.id !== "800044270370684958") return;

  const emojis = [message.guild?.emojis.cache.get("248177959192494080"), "❤", "🔥"];

  if (message.content.includes("arknarok"))
    emojis.splice(1, 0, message.guild?.emojis.cache.get("324253416870117386"));

  const emojisPromises = emojis
    .filter((e) => e !== undefined)
    .map((e) => message.react(e as string | Discord.GuildEmoji));
  Promise.all(emojisPromises)
    .then((es) => {
      console.log(es.map((e) => e.emoji.name).join("  ") ?? "NO EMOJIS");
    })
    .catch(console.error);
});

RuRaColor.on(Events.MessageCreate, async (message: Discord.Message) => {
  if (message.channel.id !== "467084051027853324") return;
  if (message.content !== "version") return;

  message.reply(process.env["COMMIT_INFO"] ?? "");
});

RuRaColor.login(process.env["BOT_RURACOLOR_TOKEN"]);
