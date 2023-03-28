import * as Discord from "discord.js";
import { Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

import fs from "node:fs/promises";

dotenv.config();

import type * as APITypes from "./types/api";
import type { IJSONStorage } from "./types/db";

import getDB from "./modules/db";

import Listener from "./modules/sender/listener";
import type { UpdateInfo } from "./modules/sender/update";
import getTextUpdate from "./modules/sender/update";

const sendMessagesIds = new Set<string>();

const RuRaColor = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,

    GatewayIntentBits.MessageContent,
  ],
});

RuRaColor.on(Events.Debug, (log) => {
  fs.writeFile(
    "./logs.txt",
    `${new Date()
      .toLocaleDateString("ru-ru", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        formatMatcher: "basic",
      })
      .replaceAll(".", "/")}: ${log}\n`,
    {
      encoding: "utf-8",
      flag: "a",
    }
  );
});

RuRaColor.on(Events.ClientReady, async () => {
  const hook = await RuRaColor.fetchWebhook(
    (process.env["NODE_ENV"] as string) === "production"
      ? (process.env["HOOK_RURA_ID"] as string)
      : (process.env["HOOK_CAPTAINHOOK_ID"] as string),
    (process.env["NODE_ENV"] as string) === "production"
      ? (process.env["HOOK_RURA_TOKEN"] as string)
      : (process.env["HOOK_CAPTAINHOOK_TOKEN"] as string)
  );

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

      sendMessagesIds.add(message.id);

      editMessage(message, messageContent);

      DB.setTime(new Date(u.showTime));
    }
  }

  async function sendUpdate(title: UpdateInfo): Promise<Discord.Message<boolean>> {
    const { update, coverBuffer } = title;

    const message: Discord.WebhookMessageCreateOptions = {
      content: update,
      allowedMentions: {
        roles: [process.env["ROLE_TO_PING_ID"] as string],
      },
    };

    if (coverBuffer) message.files = [coverBuffer];

    console.log("SENDING " + title.info.title);

    return await hook.send(message);
  }

  function editMessage(message: Discord.Message<boolean>, updateInfo: UpdateInfo) {
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

    setTimeout(() => {
      clearInterval(interval);
      sendMessagesIds.delete(message.id);
      console.log("DELETING FROM CACHE ID: " + message.id);
    }, new Date(0).setHours(4, 1));
  }
});

RuRaColor.on(Events.MessageCreate, async (message: Discord.Message) => {
  if (message.channel.id !== "800044270370684958") return;

  setTimeout(() => {
    console.log(`MESSAGE ID: ${message.id} in [${[...sendMessagesIds].join(", ")}]`);

    if (!sendMessagesIds.has(message.id)) message.delete();
  }, 5_000);

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
