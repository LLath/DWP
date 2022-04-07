const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord-api-types/v9");

const { getFreeGames } = require("../epic/getFreeGames");
const { message } = require("../epic/message");
const scheduleManager = require("../helpers/scheduleManager");
const colors = require("../constants/colors");

module.exports = {
  description: "Post free epic games",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "set",
      description: "Set up posting free epic games",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "textchannel",
          description: "Text channel the clips will be posted in",
          type: ApplicationCommandOptionType.Channel,
        },
        {
          name: "role",
          description: "This role will be pinged",
          type: ApplicationCommandOptionType.Role,
        },
        {
          name: "color",
          description: "Choose embed color",
          type: ApplicationCommandOptionType.Number,
          choices: [...colors.getColors()],
        },
      ],
    },
    {
      name: "stop",
      description: "Stop posting free epic games",
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
  callback: async (interaction, options) => {
    let discordChannel = interaction.channel;
    let embedColor = options.getNumber("color");
    if (embedColor === null) {
      embedColor = 3447003;
    }
    const subCommand = options.getSubcommand();
    const textChannel = options.getChannel("textchannel");
    const role = options.getRole("role");
    if (textChannel !== null) {
      discordChannel = await interaction.guild.channels.fetch(textChannel.id);
    }

    if (subCommand === "stop") {
      console.log("INFO: stop");
      await interaction.reply({
        content: "Posting free epic games is stopped",
        ephemeral: true,
      });
      scheduleManager.stopById(discordChannel.id);
      return;
    }
    await interaction.reply({
      content: `Free epic games will be posted in Channel <\#${discordChannel.id}>.`,
      ephemeral: true,
    });

    const fetchGames = async () => {
      const { freeGames, upcomingPromotions } = await getFreeGames();

      freeGames.forEach((game) => {
        message(discordChannel, game, role, embedColor);
      });
      return upcomingPromotions;
    };

    await scheduleManager.createSchedule({
      id: discordChannel.id,
      scheduleFn: () => fetchGames(),
      changeSchedule: true,
      type: interaction.commandName,
    });
  },
};
