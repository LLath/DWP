const { Client } = require("discord.js");
const { log } = require("@llath/logger");
const fetch = require("node-fetch");

/**
 *
 * @param {Client} client
 * @param {*} commands
 */
const restart = async (client, commands) => {
  for (let command in commands) {
    try {
      const _command = command + process.env.NODE_ENV;
      const items = await fetch(
        `${process.env.API_V1_DB}/getItems/${_command}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());

      items.forEach(async (item) => {
        const channel = await client.channels.fetch(item.id);
        commands[command].callback(null, null, channel, item);
      });
    } catch (error) {
      log(`${command} failed while searching db ${error}`, "error");
    }
  }
};

module.exports = { restart };
