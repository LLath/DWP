require("dotenv").config();
const schedule = require("node-schedule");
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const ytdl = require("ytdl-core");
const fetch = require("node-fetch");

// Relative imports
const messages = require("./messages/messages.initialize");
const roll = require("./roll/roll");
const dwCommand = require("./dw/dwCommands");
const dwOptions = require("./dw/dwOptions");
const macro = require("./macro/macro");
const db = require("./database/connection");
const { find } = require("./database/database.macros");

let channel = "";

// const j = schedule.scheduleJob("45 13 * * 7", () => {
//   channel.send("Erinnerung! In 15 fängt das Spiel an.");
// });

client.on("ready", () => {
  console.log("Connected as: " + client.user.tag);

  client.user.setActivity("DungeonWorld", { type: "STREAMING" });

  channel = client.channels.cache.get("701102057637281822");
  // const guild = client.guilds.cache.get(msg.guild.id);
  // const roleID = guild.member(msg.author.id)._roles[0];
  // const role = guild.roles.cache.find((v) => v.name === "PnP");
  // channel.send(role);
});

const prefix = "?";

const help_descriptions = Object.keys(messages).map(
  (key) => `${messages[`${key}`].description}`
);
const help_keys = Object.keys(messages).map((key) => `${prefix}${key}`);
client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content.indexOf(prefix) !== 0) return;

  const data = await find(db, msg.client.user.id);
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
    // case `${prefix}schedule`:
    //   channel = client.channels.cache.get(msg.channel.id);
    //   msg.channel.send("Scheduled your Event");
    //   break;
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
      macro(msg, macroContent, db);
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

    default:
      break;
  }
});

client.login(process.env.TOKEN);
