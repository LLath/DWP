const { Client } = require("discord.js");
const { log } = require("@llath/logger");

const { useModel } = require("../database/database.functions");

/**
 *
 * @param {Client} client
 * @param {*} commands
 */
const restart = async (client, commands) => {
  for (let command in commands) {
    try {
      const db = useModel(command);
      const _command = command + process.env.NODE_ENV;
      const items = await db.findAll(_command);
      items.forEach(async (item) => {
        const channel = await client.channels.fetch(item.id);
        commands[command].callback(null, null, channel, item);
      });
    } catch (error) {
      log(`${command} failed while searching db`, "error");
    }
  }
};

module.exports = { restart };
