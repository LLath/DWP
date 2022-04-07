const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord-api-types/v9");

const { fetchClips } = require("../twitch/clips/getClips");
const { getChannelID } = require("../twitch/getChannelID");
const scheduleManager = require("../helpers/scheduleManager");
const {
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");

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
        {
          name: "time",
          description: "Hour from 1-24 when clips should be posted",
          type: ApplicationCommandOptionType.Number,
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
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   * @returns
   */
  callback: async (interaction, options) => {
    let discordChannel = interaction.channel;
    let time = options.getNumber("time");
    if (time === null) {
      time = new Date().getDate();
    }
    if (time > 24 || time < 1) {
      await interaction.reply({
        content: `${time} is not a valid hour of a day. Please try another number. If you think that's not correct please contact the developer :)`,
        ephemeral: true,
      });
      return;
    }
    const subCommand = options.getSubcommand();
    const textChannel = options.getChannel("textchannel");
    if (textChannel !== null) {
      discordChannel = await interaction.guild.channels.fetch(textChannel.id);
    }

    if (subCommand === "stop") {
      console.log("INFO: stop");
      await interaction.reply({
        content: "Posting of clips will be stopped",
        ephemeral: true,
      });
      scheduleManager.stopById(discordChannel.id);
      return;
    }

    const twitchChannelName = options.getString("twitchchannelname");

    const { id, error } = await getChannelID(twitchChannelName);
    if (error) {
      console.log(error);
      await interaction.reply({
        content: `An Error occured while fetching twitch id with name ${twitchChannelName}: ${error}`,
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: `Clips will be posted in Channel <\#${discordChannel.id}> every day.`,
      ephemeral: true,
    });

    await scheduleManager.createSchedule({
      id: discordChannel.id,
      scheduleFn: () => fetchClips(id, discordChannel),
      time: { hour: time },
      type: interaction.commandName,
    });
  },
};
