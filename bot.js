require("dotenv").config();
const schedule = require("node-schedule");
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const messages = require("./messages/messages.initialize");
const roll = require("./roll/roll");
const dwCommand = require("./dw/dwCommands");
const dwOptions = require("./dw/dwOptions");

let channel = "";

const j = schedule.scheduleJob("45 15 * * 7", () => {
  channel.send("Erinnerung! In 15 fängt das Spiel an.");
});

client.on("ready", () => {
  console.log("Connected as: " + client.user.tag);

  client.user.setActivity("DungeonWorld", { type: "LISTENING" });

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
client.on("message", (msg) => {
  if (msg.author.bot) return;
  if (msg.content.indexOf(prefix) !== 0) return;

  let modify = msg.content.split(" ");
  let rollOptions = [...modify];
  const command = modify.shift().slice(prefix.length);
  const option = modify.splice(1, 1);

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

    default:
      break;
  }
});

client.login(process.env.TOKEN);
