const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { log } = require("@llath/logger");

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const connectRest = async (guildID, commands) => {
  try {
    log("Started refreshing application (/) commands.", "info");

    if (guildID === undefined) {
      log("Put global commands", "info");
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
    } else {
      log("Put guild commands", "info");
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID),
        {
          body: commands,
        }
      );
    }

    log("Successfully reloaded application (/) commands.", "info");
  } catch (error) {
    error(error, "error");
  }
};

module.exports = { connectRest };
