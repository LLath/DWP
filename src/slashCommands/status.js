const { ApplicationCommandType } = require("discord-api-types/v9");

const scheduleManager = require("../helpers/scheduleManager");

module.exports = {
  type: ApplicationCommandType.User,
  callback: async (message, options) => {
    await message.reply({
      content: scheduleManager.getStatus(),
      ephemeral: true,
    });
  },
};
