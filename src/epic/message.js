const { Channel } = require("discord.js");

/**
 *
 * @param {Channel} channel
 */
const message = (channel, { title, promotion, url, thumbnail }, role) => {
  const description = {};
  if (role !== null) {
    description.description = `<@&${role.id}>`;
  }
  const period = `${new Date(
    promotion.endDate
  ).toLocaleDateString()} ${new Date(promotion.endDate)
    .toLocaleTimeString("en-US")
    .replace(":00:00", "")} UTC`;

  channel.send({
    embeds: [
      {
        color: 3447003,
        thumbnail: {
          url: thumbnail,
        },
        image: {
          url: thumbnail,
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
