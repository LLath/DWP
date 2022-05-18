const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord-api-types/v9");
const {
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");
const { log } = require("@llath/logger");

const { fetchClips } = require("../twitch/clips/getClips");
const { getChannelID } = require("../twitch/getChannelID");
const scheduleManager = require("../helpers/scheduleManager");

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
          focused: true
        },
        {
          name: "textchannel",
          description: "Text channel the clips will be posted in",
          type: ApplicationCommandOptionType.Channel,
        },
        {
          name: "time",
          description: "Hour from 0-23 when clips should be posted; uses UTC",
          type: ApplicationCommandOptionType.Number,
        },
        {
          name: "immediat",
          description: "Should the task run immediately default=false",
          type: ApplicationCommandOptionType.Boolean,
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
  callback: async (interaction, options, discordChannel, dbItem) => {
    let commandName;
    let runImmediately = false;
    let twitchChannelName;
    let time;

    if (interaction !== null && options !== null) {
      commandName = interaction.commandName;
      discordChannel = interaction.channel;
      runImmediately = options.getBoolean("immediat");
      time = options.getNumber("time");
      if (time === null) {
        time = new Date().getHours();
      }
      if (time >= 24 || time < 0) {
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
        log("stop", "info");
        await interaction.reply({
          content: "Posting of clips will be stopped",
          ephemeral: true,
        });
        scheduleManager.stopById(discordChannel.id);
        return;
      }
      twitchChannelName = options.getString("twitchchannelname");

      await interaction.reply({
        content: `Clips will be posted in Channel <\#${discordChannel.id}> every day.`,
        ephemeral: true,
      });
    } else {
      commandName = dbItem.type;
      discordChannel.id = dbItem.id;
      time = dbItem.time.hour;
      twitchChannelName = dbItem.name;
    }

    const { id, error } = await getChannelID(twitchChannelName);

    if (error?.message) {
      const errorMessage = {
        content: `An Error occured while fetching twitch id with name ${twitchChannelName} 
        ERROR: ${error.statusCode} ${error.message}`,
        ephemeral: true,
      };
      log(error, "error");
      if (interaction === null) {
        discordChannel.send(errorMessage);
        return;
      }
      await interaction.editReply(errorMessage);
      return;
    }

    await scheduleManager.createSchedule({
      id: discordChannel.id,
      scheduleFn: () => fetchClips(id, discordChannel),
      time: { hour: time },
      type: commandName,
      runImmediately,
      name: twitchChannelName,
      dc_name: discordChannel.name
    });
  },
};
