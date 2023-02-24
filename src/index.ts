import * as Discord from "discord.js";
import { Events, GatewayIntentBits } from "discord.js";
import needle from "needle";
import * as dotenv from "dotenv";

dotenv.config();

import type * as APITypes from "./types/api";
import type { IJSONStorage } from "./types/db";

import getDB from "./modules/db";

import Listener from "./modules/sender/listener";
import Update from "./modules/sender/update";

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

async function updateHandler(
  updates: APITypes.VolumeUpdates.Content | APITypes.VolumeUpdates.Content[]
): Promise<void> {
  updates = updates instanceof Array ? updates : [updates];

  for (const u of updates) {
    if (!u) continue;

    try {
      const time = DB.getTime();

      if (!time) throw new Error("SL ERROR: BAD TIME --- DROP UPDATE");

      const title = new Update(u, time);

      const message = await sendUpdate(title);

      editMessage(message.id, title);

      DB.setTime(new Date(u.showTime));
    } catch (e) {
      console.error(e);
    }
  }
}

async function sendUpdate(title: Update): Promise<Discord.APIMessage> {
  const update = await title.createUpdate();
  const text = update.toString();
  const imgBuffer = await update.getCover();

  return await hook.send({ content: text, files: [imgBuffer] });
}

function editMessage(messageID: string, title: Update) {
  const interval = setInterval(async () => {
    const update = await title.createUpdate();

    const data = {
      content: update.toString(),
      allowed_mentions: {
        roles: [process.env["ROLE_TO_PING_ID"]],
      },
    };

    needle.patch(
      `https://discord.com/api/webhooks/${hook.id}/${hook.token}/messages/${messageID}`,
      data,
      (_err, res) => {
        console.log(`EDIT WEBHOOK MESSAGE STATUS: ${res.statusCode}`);
      }
    );
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

RuRaColor.login(process.env["BOT_RURACOLOR_TOKEN"]);
