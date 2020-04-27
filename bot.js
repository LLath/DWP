require("dotenv").config();
const path = require("path");
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const messages = require("./messages/messages.initialize");

client.on("ready", () => {
  console.log("Connected as: " + client.user.tag);

  client.user.setActivity("DungeonWorld", { type: "PLAYING" });
});

const prefix = "?";

const help_descriptions = Object.keys(messages).map(
  (key) => `${messages[`${key}`].description}`
);
const help_keys = Object.keys(messages).map((key) => `${prefix}${key}`);
client.on("message", (msg) => {
  if (msg.author.bot) return;
  if (msg.content.indexOf(prefix) !== 0) return;

  switch (msg.content.toLowerCase()) {
    case `${prefix}stats`:
      msg.channel.send(`${messages.stats.description}`, {
        files: [path.resolve("./pics/stats.png")],
      });
      break;
    case `${prefix}help`:
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
    case `${prefix}shellforge`:
      msg.channel.send(
        `Shellforge \n https://www.worldanvil.com/w/dungeonworld-llath/map/0402bb7b-8426-4bb9-a593-a8f79e0e5467`
      );
      break;
    case `${prefix}moves`:
      msg.channel.send(
        `${messages.moves.description} \n https://drive.google.com/file/d/1i_uSLzaIWO3yvm5eBYuk6mM_ohDtAVKx/view`
      );
      break;
    case `${prefix}sheets`:
      msg.channel.send(
        `${messages.sheets.description} https://drive.google.com/drive/folders/1YVs2Nx6FGd5ZZhqbgWERt0HhHLxdDmnd`
      );
      break;

    default:
      break;
  }
});

client.login(process.env.TOKEN);
