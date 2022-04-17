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
        {
          name: "immediat",
          description: "Should the task run immediately default=false",
          type: ApplicationCommandOptionType.Boolean,
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
  callback: async (interaction, options, discordChannel, dbItem) => {
    let commandName;
    let role = null;
    let embedColor;
    let runImmediately = false;
    if (interaction !== null && options !== null) {
      commandName = interaction.commandName;
      discordChannel = interaction.channel;
      role = options.getRole("role")?.id;
      embedColor = options.getNumber("color");
      if (embedColor === null) {
        embedColor = 3447003;
      }
      const subCommand = options.getSubcommand();
      const textChannel = options.getChannel("textchannel");
      if (textChannel !== null) {
        discordChannel = await interaction.guild.channels.fetch(textChannel.id);
      }
      runImmediately = options.getBoolean("immediat");

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
    } else {
      commandName = dbItem.type;
      role = dbItem.role;
      embedColor = dbItem.embedColor;
      discordChannel.id = dbItem.id;
    }

    const fetchGames = async () => {
      const { freeGames, upcomingPromotions } = await getFreeGames();

      if (runImmediately) {
        freeGames.forEach((game) => {
          message(discordChannel, game, role, embedColor);
        });
      } else {
        runImmediately = true;
      }
      return upcomingPromotions;
    };

    await scheduleManager.createSchedule({
      id: discordChannel.id,
      scheduleFn: () => fetchGames(),
      changeSchedule: true,
      type: commandName,
      runImmediately,
      role,
      embedColor,
    });
  },
};
