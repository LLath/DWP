require("dotenv").config();
const { Client, MessageEmbed } = require("discord.js");
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_TYPING"],
});
const ytdl = require("ytdl-core");
const fetch = require("node-fetch");
const { ToadScheduler, SimpleIntervalJob, Task } = require("toad-scheduler");

// Relative imports
const messages = require("./messages/messages.initialize");
const roll = require("./roll/roll");
const dwCommand = require("./dw/dwCommands");
const dwOptions = require("./dw/dwOptions");
const macro = require("./macro/macro");
// const db = require("./database/connection");
const { find } = require("./database/database.macros");

const twitchOptions = {
  headers: new fetch.Headers({
    Authorization: `Bearer ${process.env.TWITCH_API}`,
    "Client-Id": process.env.TWITCH_CLIENT_ID,
  }),
};

const fetchClips = async (id, channel, time) => {
  time = new Date(time.setDate(time.getDate() - 1));

  const { data } = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${id}&started_at=${time.toISOString()}`,
    twitchOptions
  )
    .then((data) => data.json())
    .catch((err) => console.log(err));

  console.log("DATA undefined", data);

  if (data === undefined || data?.length < 1) {
    return;
  }

  console.log("DATA", data);

  const clipMessage = (clip) =>
    `${clip.broadcaster_name} - ${clip.title} \nCreator: ${clip.creator_name} \n${clip.url}`;

  channel.send(`Todays clips are:`);

  data.map((clip) => {
    channel.send(`${clipMessage(clip)}`);
  });
};

const setChannel = async (name, channel) => {
  const scheduler = new ToadScheduler();
  if (name === "stop") {
    scheduler.stop();
    return;
  }

  const { data } = await fetch(
    `https://api.twitch.tv/helix/users?login=${name}`,
    twitchOptions
  )
    .then((data) => data.json())
    .catch((err) => console.log(err));

  const task = new Task("simple task", () => {
    fetchClips(data[0].id, channel, new Date());
  });
  const job = new SimpleIntervalJob({ days: 1 }, task);

  scheduler.addSimpleIntervalJob(job);
};

client.on("ready", () => {
  console.log("Connected as: " + client.user.tag);

  client.user.setUsername("TDWP");
  client.user.setActivity("Twitch", { type: "WATCHING" });

  // channel = client.channels.cache.get("701102057637281822");
  // guild = client.guilds.cache.get("704271804578922578");
  // console.log(guild.channels.get);
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
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content.indexOf(prefix) !== 0) return;

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
    case `clips`:
      console.log("CLIPSSSS");
      msg.channel.send(
        `Clips will be posted in Channel ${msg.channel} every day. You can stop that with ?clips stop`
      );
      setChannel(modify.toString(), msg.channel);

      break;
    default:
      break;
  }
});

client.login(process.env.TOKEN);
