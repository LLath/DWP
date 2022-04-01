const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const connectRest = async (guildID, commands) => {
  try {
    console.log("Started refreshing application (/) commands.");

    if (guildID === undefined) {
      console.log("INFO: Put global commands");
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
    } else {
      console.log("INFO: Put guild commands");
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID),
        {
          body: commands,
        }
      );
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("ERROR:", error);
  }
};

module.exports = { connectRest };
