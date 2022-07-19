const { Channel } = require("discord.js");

/**
 *
 * @param {Channel} channel
 */
const message = (
  channel,
  { title, promotion, url, thumbnail: _thumbnail },
  role,
  embedColor
) => {
  const description = {};
  if (role !== null && role !== undefined) {
    description.description = `<@&${role}>`;
  }
  const period = `${new Date(
    promotion.endDate
  ).toLocaleDateString()} ${new Date(promotion.endDate)
    .toLocaleTimeString("en-US")
    .replace(":00:00", "")} UTC`;

  channel.send({
    embeds: [
      {
        color: embedColor,
        thumbnail: {
          url: _thumbnail,
        },
        image: {
          url: _thumbnail,
        },
        title: title,
        url: url,
        ...description,
        fields: [
          {
            name: "Free until",
            value: period,
            inline: false,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "Click on the name to got to the store",
        },
      },
    ],
  });
};

module.exports = { message };
