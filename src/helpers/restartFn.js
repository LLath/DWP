const { Client } = require("discord.js");
const { useModel } = require("../database/database.functions");

/**
 *
 * @param {Client} client
 * @param {*} commands
 */
const restart = async (client, commands) => {
  for (const command in commands) {
    try {
      const db = useModel(command);
      const items = await db.findAll(command);
      items.forEach(async (item) => {
        const channel = await client.channels.fetch(item.id);
        commands[command].callback(null, null, channel, item);
      });
    } catch (error) {
      console.log(`INFO: ${command} has no db model`);
    }
  }
};

module.exports = { restart };
