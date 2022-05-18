const { Client } = require("discord.js");
const { log } = require("@llath/logger");
const fetch = require("node-fetch");

const { getFiles } = require("./src/helpers/getFiles");
const { connectRest } = require("./src/api/connection");
const { restart } = require("./src/helpers/restartFn");

const suffix = ".js";
const pathPrefix = "./src";

const loadCommands = (commandFiles) => {
  const commands = {};
  for (const command of commandFiles) {
    let commandFile = require(command);
    if (commandFile.default) commandFile = commandFile.default;

    const split = command.replace(/\\/g, "/").split("/");
    const commandName = split[split.length - 1].replace(suffix, "");
    commandFile["name"] = `${commandName}${process.env.NODE_ENV}`;

    commands[commandName.toLowerCase()] = commandFile;
  }

  return commands;
};

/**
 *
 * @param {Client} client DiscordJS client
 */
const handleCommands = (client) => {
  const commandFiles = getFiles(`${pathPrefix}/commands`, suffix);
  log("handleCommands - commandFiles " + commandFiles, "info");

  const commands = loadCommands(commandFiles);

  client.on("messageCreate", (message) => {
    if (message.author.bot || !message.content.startsWith("?")) return;

    const args = message.content.slice(1).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commands[commandName]) return;

    try {
      commands[commandName].callback(message, ...args);
    } catch (error) {
      log(error, "error");
    }
  });
};

/**
 *
 * @param {Client} client DiscordJS Client
 * @param {string=} guildname Guild specific commands
 */
const handleSlashCommands = async (client, guildname) => {
  let guildID = undefined;
  if (guildname !== undefined) {
    guildID = await client.guilds
      .fetch()
      .then((guilds) => guilds.find((guilds) => guilds.name === guildname).id);
  }

  const commandFiles = getFiles(`${pathPrefix}/slashCommands`, suffix);
  log(`handleSlashCommands - commandFiles` + commandFiles.join("\n"), "info");
  const commands = loadCommands(commandFiles);

  const commandsArray = Object.keys(commands).map(
    (command) => commands[command]
  );

  await connectRest(guildID, commandsArray);

  try {
    const isConnected = await fetch(
      `${process.env.API_V1}services/isConnected`
    ).then((res) => res.json());

    if (isConnected) await restart(client, commands);
  } catch (error) {
    log(error, "error");
  }

  client.on("interactionCreate", async (interaction) => {
    const { commandName, options } = interaction;
    let _commandName = commandName;
    if (!interaction.isCommand() && !interaction.isUserContextMenu()) return;

    if (process.env.NODE_ENV === "dev") {
      _commandName = _commandName.replace(/dev$/g, "");
    }
    try {
      await commands[_commandName].callback(interaction, options);
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = { handleCommands, handleSlashCommands };
