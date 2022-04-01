//#region imports
require("dotenv").config();
const { Client, MessageEmbed, Permissions } = require("discord.js");
const ytdl = require("ytdl-core");
const fetch = require("node-fetch");

// Relative imports
const messages = require("./archived/messages/messages.initialize");
const roll = require("./archived/roll/roll");
const dwCommand = require("./archived/dw/dwCommands");
const dwOptions = require("./archived/dw/dwOptions");
const macro = require("./archived/macro/macro");
// const db = require("./archived/database/connection");
const { find } = require("./archived/database/database.macros");

const { useSchedule } = require("./src/twitch/clips/scheduler");
const { getEmotes } = require("./src/twitch/emotes/getEmotes");
const { connectRest } = require("./src/api/connection");
//#endregion

const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_TYPING",
    "GUILD_VOICE_STATES",
  ],
});
const schedulerArray = [];

//#region client on ready
client.on("ready", async (_client) => {
  process.env.CLIENT_ID = _client.user.id;
  console.log("CLIENT_ID", _client.user.id);

  console.log("Connected as: " + _client.user.tag);

  _client.user.setUsername("RootClipper");
  _client.user.setActivity("You", { type: "WATCHING" });

  const { handleCommands, handleSlashCommands } = require("./command-handler");

  handleCommands(_client);
  await handleSlashCommands(_client);
});

//#endregion

const prefix = "?";

const help_descriptions = Object.keys(messages).map(
  (key) => `${messages[`${key}`].description}`
);
const help_keys = Object.keys(messages).map((key) => `${prefix}${key}`);
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content.indexOf(prefix) !== 0) return;

  if (
    msg.member.roles.cache.find((role) => role.name === "MODS") === undefined &&
    msg.member.roles.cache.find((role) => role.name === "PlantQui") ===
      undefined &&
    msg.member.roles.cache.find((role) =>
      role.name.toLowerCase().includes("pandaleo cub")
    ) === undefined
  ) {
    return;
  }

  // const data = await find(db, msg.client.user.id)
  const data = null;
  const dataMacros =
    data !== null
      ? data.macros.filter((c) => c.macro.includes(msg.content))
      : [];

  if (dataMacros.length > 0) {
    msg.content = dataMacros[0].command;
  }

  let modify = msg.content.split(" ");
  let rollOptions = [...modify];
  const command = modify.shift().slice(prefix.length);
  const option = modify.splice(1, 1);
  const macroContent = msg.content.split('"').slice(1);

  const YTq = new Array();
  const voiceChannel = msg.member.voice.channel;

  switch (command.toLowerCase()) {
    //#region DWP
    case `stats`:
      msg.channel.send(`${messages.stats.description}`, messages.stats.message);
      break;
    case `help`:
      const embed = new MessageEmbed()
        .setTitle("All my Commands:")
        .setColor(0xff0000)
        .addFields(
          {
            name: "commands",
            value: help_keys,
            inline: true,
          },
          { name: "description", value: help_descriptions, inline: true }
        );
      msg.channel.send(embed);
      break;
    case `shellforge`:
      msg.channel.send(messages.shellforge.message);
      break;
    case `moves`:
      msg.channel.send(
        `${messages.moves.description} \n ${messages.moves.message}`
      );
      break;
    case `sheets`:
      msg.channel.send(
        `${messages.sheets.description} ${messages.sheets.message}`
      );
      break;
    case `spoiler`:
      msg.channel.send(
        `${messages.spoiler.description}`,
        messages.spoiler.message
      );
      break;
    case `roll`:
      roll(msg, rollOptions);
      break;
    case "dw":
      if (option.length > 0) {
        dwOptions(msg, modify, option);
      } else {
        dwCommand(msg, modify.shift());
      }
      break;
    case `macro`:
      // macro(msg, macroContent, db);
      break;
    case `play`:
      if (modify[0] === undefined) {
        msg.channel.send(
          `You didn't provide a url, here the current playlist: ${
            YTq.length > 0 ? YTq[0].title : "-"
          }`
        );
        return;
      }
      const YTid = modify[0].slice(modify[0].indexOf("=") + 1);
      if (!voiceChannel) {
        msg.channel.send("You need to be in a voice channel to play music!");
        return;
      }

      const permissions = voiceChannel.permissionsFor(msg.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        msg.channel.send("I need permissions to join a voice channel");
        return;
      }
      const item = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${YTid}&key=${process.env.YOUTUBE_API}`
      )
        .then((v) => v.json())
        .then((a) => a.items[0].snippet);

      const YTtemplate = {
        url: modify[0],
        title: item.title,
        thumbnail: item.thumbnails.default.url,
      };
      YTq.push(YTtemplate);
      msg.channel.send(`Added ${item.title} to the playlist.`);
      console.log(voiceChannel);
      voiceChannel
        .join()
        .then((conn) => {
          const stream = ytdl(modify[0], {
            filter: "audioonly",
          });
          const dispatcher = conn.play(stream);
          dispatcher.on("start", () => {
            const embed = new MessageEmbed()
              .setThumbnail(YTq[0].thumbnail)
              .setTitle(YTq[0].title)
              .setURL(YTq[0].url);
            dispatcher.setVolume(1);
            msg.channel.send(embed);
          });
          dispatcher.on("end", () => {
            YTq.shift();
            voiceChannel.leave();
          });
        })
        .catch((err) => {
          voiceChannel.leave();
          console.log(err);
        });

      break;
    case `stop`:
      voiceChannel.leave();
      break;
    //#endregion
    //#region twitch
    case `clips2`:
      if (modify.toString() === "stop") {
        const findSchedule = schedulerArray.find(
          (channel) => channel.id === msg.channel.id
        );
        findSchedule.scheduler.stop();
        schedulerArray.splice(schedulerArray.indexOf(findSchedule), 1);

        msg.channel.send(`Posting of clips will be stoped.`);
        return;
      } else {
        msg.channel.send(
          `Clips will be posted in Channel ${msg.channel} every day. You can stop that with ?clips stop`
        );
        useSchedule(modify.toString(), msg.channel, schedulerArray);
      }

      break;
    // useless discord connect to twitch does the same
    case `emotes`:
      getEmotes(modify.toString(), msg.channel);
      break;
    //#endregion
    case "test":
      if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        console.log("No Admin");
      }
      console.log("Admin");
      break;
    default:
      break;
  }
});

client.login(process.env.TOKEN);
