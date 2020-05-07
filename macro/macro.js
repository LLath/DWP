const { create, find } = require("../database/database.macros");
const { MessageEmbed } = require("discord.js");

const macro = async (msg, content, db) => {
  content = content.filter((c) => c.match(/[\w]/g));

  const userID = msg.client.user.id;

  if (content.length > 0) {
    const macros = {
      macro: `?m ${content[0]}`,
      command: content[1],
    };

    const template = {
      user: userID,
      macros: [macros],
    };

    const items = await find(db, userID);
    const macroNames = items !== null ? items.macros.map((m) => m.macro) : [];

    if (macroNames.includes(`?m ${content[0]}`)) {
      msg.reply("You already have a macro with that name choose another one.");
    } else {
      create(db, userID, template);

      msg.reply(`saved your macro with "?m ${content[0]}"`);
    }
  } else {
    const items = await find(db, userID);

    if (items !== null) {
      const macroNames = items !== null ? items.macros.map((m) => m.macro) : [];
      const macroCommand =
        items !== null ? items.macros.map((m) => m.command) : [];

      const embed = new MessageEmbed()
        .setTitle("All my Commands:")
        .setColor(0xff0000)
        .addFields(
          {
            name: "commands",
            value: macroNames,
            inline: true,
          },
          { name: "description", value: macroCommand, inline: true }
        );
      msg.channel.send(embed);
    } else {
      msg.reply(
        'you don\'t have any macros try creating one like \n ?macro "dodge" "?roll 2d6 -1"'
      );
    }
  }
};

module.exports = macro;
