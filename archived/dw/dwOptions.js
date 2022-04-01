const { MessageEmbed } = require("discord.js");
const dw = require("dungeonworld-data");

const dwOptions = (msg, modify, option) => {
  let _identifier = modify;
  let _item = option;
  if (
    dw.basicData[`${_identifier}`] === undefined ||
    dw.basicData[`${_identifier}`][`${_item}`] === undefined
  )
    return;
  const data = dw.basicData[`${_identifier}`][`${_item}`];
  console.log("Result:", dw.basicData[`${_identifier}`][`${_item}`]);
  // console.log(
  //   Object.keys(dw.basicData[`${_identifier}`]),
  //   dw.basicData[`${_identifier}`]
  // );
  const embed = new MessageEmbed()
    .setTitle(data.name)
    .setColor(11027200)
    .setDescription(data.description);
  msg.channel.send(embed);
};
module.exports = dwOptions;
