const fetch = require("node-fetch");
const fs = require("fs");

const { twitchOptions } = require("../OPTIONS");
const { getChannelID } = require("../getChannelID");

/**
 * fetch emotes of a channel
 *
 * @param {string} name twitch channel name
 * @param {object} channel discord message channel
 */
const getEmotes = async (name, channel) => {
  const guild = channel.guild;

  const message = await channel.send(
    `Searching twitch for emotes for channel: ${name}`
  );

  const { error, id } = await getChannelID(name, channel);

  if (error) {
    channel.send(`An Error occured: ${error}`);
  }

  const { data } = await fetch(
    `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${id}`,
    twitchOptions
  )
    .then((data) => data.json())
    .catch((err) => console.log(err));

  if (data === undefined || data?.length < 1) {
    return;
  }
  console.log("Data fetched", data.length);

  message.edit(`Found emotes for channel: ${name}`);
  data.map(({ images, name, format }) => {
    let downloadPath = `twitch/emotes/emojis/${name}.png`;
    let imagePath = images.url_4x;
    if (format.includes("animated")) {
      imagePath = images.url_4x.replace(/\W*\/static\/\W*/g, "/animated/");
      downloadPath = downloadPath.replace(/\W*png\W*/g, ".gif");
    }
    // TODO: Use this to DEBUG
    // .then((res) => res.body.pipe(fs.createWriteStream(downloadPath)))
    fetch(imagePath).then(() => {
      console.log("Creating emoji", name);
      guild.emojis
        .create(imagePath, name)
        .then((emoji) => {
          console.log(`Created new emoji with name ${emoji.name}`);
        })
        .catch((err) => {
          console.log("CATCHED");
          console.error(err);
          message.edit(err);
        });
    });
  });
};

module.exports = { getEmotes };
