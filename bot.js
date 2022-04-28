//#region imports
require("dotenv").config();
const { Client } = require("discord.js");
const { log } = require("@llath/logger");

// Relative imports
const db = require("./src/database/connection");

const { getEmotes } = require("./src/twitch/emotes/getEmotes");

//#endregion

const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_TYPING",
    "GUILD_VOICE_STATES",
  ],
});

//#region client on ready
client.on("ready", async (_client) => {
  process.env.CLIENT_ID = _client.user.id;
  log(`CLIENT_ID: ${_client.user.id}`, "info");

  log(`Connected as: ${_client.user.tag}`, "info");

  _client.user.setUsername("RootClipper");
  _client.user.setActivity("Twitch", { type: "PLAYING" });

  const { handleCommands, handleSlashCommands } = require("./command-handler");
  await db.connect();

  handleCommands(_client);
  if (process.env.NODE_ENV === "dev") {
    await handleSlashCommands(_client, "Llath's server");
  } else {
    await handleSlashCommands(_client);
  }
});

//#endregion

client.login(process.env.TOKEN);
