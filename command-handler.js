const { Client } = require("discord.js");

const { getFiles } = require("./src/helpers/getFiles");
const { connectRest } = require("./src/api/connection");
const { permissionSetter } = require("./src/helpers/permissionSetter");

const suffix = ".js";
const pathPrefix = "./src";
const loadCommands = (commandFiles) => {
  const commands = {};
  for (const command of commandFiles) {
    let commandFile = require(command);
    if (commandFile.default) commandFile = commandFile.default;

    const split = command.replace(/\\/g, "/").split("/");
    const commandName = split[split.length - 1].replace(suffix, "");
    commandFile["name"] = commandName;

    commands[commandName.toLowerCase()] = commandFile;
  }
  console.log("INFO: commands", commands);
  return commands;
};

/**
 *
 * @param {Client} client DiscordJS client
 */
const handleCommands = (client) => {
  const commandFiles = getFiles(`${pathPrefix}/commands`, suffix);
  console.log("INFO: handleCommands - commandFiles", commandFiles);

  const commands = loadCommands(commandFiles);

  client.on("messageCreate", (message) => {
    if (message.author.bot || !message.content.startsWith("?")) return;

    const args = message.content.slice(1).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commands[commandName]) return;

    try {
      commands[commandName].callback(message, ...args);
    } catch (error) {
      console.error(error);
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
  console.log("INFO: handleSlashCommands - commandFiles", commandFiles);
  const commands = loadCommands(commandFiles);

  const commandsArray = Object.keys(commands).map(
    (command) => commands[command]
  );

  await connectRest(guildID, commandsArray);

  // permissionSetter(client);

  client.on("interactionCreate", async (interaction) => {
    const { commandName, options } = interaction;
    if (!interaction.isCommand() && !interaction.isUserContextMenu()) return;

    try {
      await commands[commandName].callback(interaction, options);
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = { handleCommands, handleSlashCommands };
