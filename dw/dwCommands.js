const { MessageEmbed } = require("discord.js");
const dw = require("dungeonworld-data");
const classes = Object.keys(dw.basicData.classes);

let embed;
const dwCommand = (msg, option) => {
  if (classes.includes(option)) {
    let name = dw.basicData.classes[option].name;
    let description = dw.basicData.classes[option].description;

    embed = new MessageEmbed()
      .setTitle(name)
      .setColor(11027200)
      .setDescription(description);
    msg.channel.send(embed);
    // console.log(dw.basicData.classes[opt], opt);
  }
  switch (option) {
    case "classes":
      embed = new MessageEmbed()
        .setTitle("You can use one of these classes")
        .setColor(11027200)
        .setDescription(classes);
      msg.channel.send(embed);
      break;
    case "help":
      let data = Object.keys(dw.basicData)
        .slice(0, 10)
        .map((v) =>
          v !== "classes_list" && v !== "game_name" && v !== "equipment_list"
            ? v
            : ""
        )
        .filter((a) => a !== "");
      let example = [
        "take_watch",
        "moves.key",
        "moves.key",
        "paladin",
        "vorpal_sword",
        "hell_hound",
        "clumsy",
      ];
      const embed = new MessageEmbed()
        .setTitle("All my Dungeonworld commands:")
        .setColor(11027200)
        .addFields(
          {
            name: "commands",
            value: data,
            inline: true,
          },
          { name: "example", value: example, inline: true }
        );
      msg.channel.send(embed);
      break;

    default:
      break;
  }
};

module.exports = dwCommand;
