## ReSender

Simple bot that sends updates from <a href="http://ruranobe.ru/">RuRanobe</a> in Discord.

It works in 3 parts:

- **Updates Listener**
  It checks updates from RuRanode every 5 minutes and create "update" event if there are
- **Webhook**
  It sends decorated message to Discrod
- **Bot**
  It reacts to update, deletes duplicate messages(now this is known bug)

## Usage

The code is not flexible enough as it was not intended to be used by third parties, but you can easily install my bot on your server.

### Prerequisites

To start using ReSender, ensure the following packages are installed:

- Node [download](https://nodejs.org/en/download/)
- Git [download](https://git-scm.com/downloads)

### Installing

```sh
git clone https://github.com/SaLapus/Resender.git
cd ./Resender

npm install
# or if you already have typescript globally
npm install --omit=dev

npx tsc
```

Then you need to create .env file in project root folder with the following content:

```dotenv
NODE_ENV=production

# You need to set your own values after "=" sign

# ID and token of Discord Webhook that send updates into Discrod channel
HOOK_RURA_ID=
HOOK_RURA_TOKEN=

# Token of Discord bot to work with updates sended by Webhook
BOT_RURACOLOR_TOKEN=

# ID of channel to which updates will be sent
PROD_UPDATE_CHANNEL=

# Role to ping when end of volume posted
ROLE_TO_PING_ID=

# (Optional) Custom emoji from your server to react every update
RURA_EMOJI_ID=
# (Optional) Custom emoji from your server to react every Arknarok`s update
ARK_EMOJI_ID=

HOST_IMAGE=groundzero.top
HOST_VOLUME=api.novel.tl

```

### Launching

```sh
node ./js/bot.js
```
