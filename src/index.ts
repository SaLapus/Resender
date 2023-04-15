/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as Discord from "discord.js";
import { Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

import { PerformanceObserver, performance } from "node:perf_hooks";

dotenv.config();

import type * as APITypes from "./types/api";
import type { IJSONStorage } from "./types/db";

import awaitQueue from "./modules/awaitQueue";

import getDB from "./modules/db";

import Listener from "./modules/sender/listener";
import type { UpdateInfo } from "./modules/sender/update";
import getTextUpdate from "./modules/sender/update";

import "./diagnostic";

const nodeEnv = process.env["NODE_ENV"]!;
const updateChannelId =
  nodeEnv === "production"
    ? process.env["PROD_UPDATE_CHANNEL"]!
    : process.env["DEBUG_UPDATE_CHANNEL"]!;
const hookId =
  nodeEnv === "production" ? process.env["HOOK_RURA_ID"]! : process.env["HOOK_CAPTAINHOOK_ID"]!;
const queue = new awaitQueue();
const sendMessagesIds = new Set<string>();

const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`Measure: ${entry.name} duration: ${entry.duration}`);
  });
});

obs.observe({ type: "measure" });

const RuRaColor = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,

    GatewayIntentBits.MessageContent,
  ],
});

// RuRaColor.on(Events.Debug, () => {});

RuRaColor.on(Events.ClientReady, async () => {
  const channel = RuRaColor.channels.cache.get(updateChannelId);

  if (!channel || channel.type !== Discord.ChannelType.GuildText)
    throw "Unsupported type of channel";

  const hooks = await channel.fetchWebhooks();

  const hook = hooks.find((hook) => hook.id === hookId);
  if (!hook) throw "Bad Hook ID: " + hookId;

  const DB: IJSONStorage = getDB();
  const UpdatesListener = new Listener();

  UpdatesListener.on("update", updateHandler);
  UpdatesListener.shedule();
  // UpdatesListener.getLastUpdate();

  async function updateHandler(updates: APITypes.VolumeUpdates.Content[]): Promise<void> {
    try {
      for (const u of updates) {
        if (!u) continue;

        const dateFrom = DB.getTime();

        if (!dateFrom) throw new Error("SL ERROR: BAD TIME --- DROP UPDATE");

        const messageContent = await getTextUpdate({
          projectID: u.projectId,
          volumeID: u.volumeId,
          dateFrom,
        });

        const entry = queue.add();

        try {
          performance.mark("Before");
          const message = await sendUpdate(messageContent);
          performance.mark("After");

          console.log("SENDED MESSAGE ID: ", message.id);
          sendMessagesIds.add(message.id);

          editMessage(message, messageContent);

          DB.setTime(new Date(u.showTime));
          performance.measure(`Sending message #${message.id}`, "Before", "After");
        } finally {
          entry.done();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function sendUpdate(title: UpdateInfo): Promise<Discord.Message<boolean>> {
    const { update, coverBuffer } = title;

    const message: Discord.WebhookMessageCreateOptions = {
      content: update,
      allowedMentions: {
        roles: [process.env["ROLE_TO_PING_ID"]!],
      },
    };

    if (coverBuffer) message.files = [coverBuffer];

    console.log("SENDING " + title.info.title);

    return await hook!.send(message);
  }

  function editMessage(message: Discord.Message<boolean>, updateInfo: UpdateInfo) {
    const interval = setInterval(async () => {
      const { update } = await getTextUpdate({
        projectID: updateInfo.info.projectID,
        volumeID: updateInfo.info.volumeID,
        dateFrom: updateInfo.info.dateFrom,
      });

      hook!.editMessage(message, {
        content: update,
        allowedMentions: {
          roles: [process.env["ROLE_TO_PING_ID"]!],
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
  if (message.channel.id !== updateChannelId) return;

  setTimeout(async () => {
    await queue.wait();
    console.log(`MESSAGE ID: ${message.id} in [${[...sendMessagesIds].join(", ")}]`);

    if (!sendMessagesIds.has(message.id)) {
      try {
        await message.delete();
      } catch (e) {
        console.error(e);
      }
    } else {
      const emojis = [message.guild?.emojis.cache.get(process.env["RURA_EMOJI_ID"]!), "❤", "🔥"];

      if (message.content.includes("arknarok"))
        emojis.splice(1, 0, message.guild?.emojis.cache.get(process.env["ARK_EMOJI_ID"]!));

      const emojisPromises = emojis
        .filter((e) => e !== undefined)
        .map((e) => message.react(e!));
      Promise.all(emojisPromises)
        .then((es) => {
          console.log(es.map((e) => e.emoji.name).join("  ") ?? "NO EMOJIS");
        })
        .catch(console.error);
    }
  }, 0);
});

RuRaColor.login(process.env["BOT_RURACOLOR_TOKEN"]);
