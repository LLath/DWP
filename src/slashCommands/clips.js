const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord-api-types/v9");

const { useSchedule, scheduler } = require("../twitch/clips/scheduler");
const { getChannelID } = require("../twitch/getChannelID");

module.exports = {
  description: "Setup daily posts of clips from a specific twitch channel",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "set",
      description: "Set up daily clips posts",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "twitchchannelname",
          description: "Twitch channelname you want to post clips",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
        {
          name: "textchannel",
          description: "Text channel the clips will be posted in",
          type: ApplicationCommandOptionType.Channel,
        },
      ],
    },
    {
      name: "stop",
      description: "Stop clips from being posted",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "textchannel",
          description: "Text channel posts you want to stop",
          type: ApplicationCommandOptionType.Channel,
        },
      ],
    },
  ],
  callback: async (message, options) => {
    let discordChannel = message.channel;
    const subCommand = options.getSubcommand();
    const textChannel = options.getChannel("textchannel");
    if (textChannel !== null) {
      discordChannel = await message.guild.channels.fetch(textChannel.id);
    }

    if (subCommand === "stop") {
      console.log("INFO: stop");
      await message.reply({
        content: "Posting of clips will be stopped",
        ephemeral: true,
      });
      scheduler.removeById(discordChannel.id);
      return;
    }

    const twitchChannelName = options.getString("twitchchannelname");

    const { id, error } = await getChannelID(twitchChannelName);
    if (error) {
      console.log(error);
      await message.reply({
        content: `An Error occured while fetching twitch id with name ${twitchChannelName}: ${error}`,
        ephemeral: true,
      });
      return;
    }
    await message.reply({
      content: `Clips will be posted in Channel <\#${discordChannel.id}> every day.`,
      ephemeral: true,
    });
    await useSchedule(id, discordChannel);
  },
};
