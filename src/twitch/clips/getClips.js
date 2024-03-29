const { Channel } = require("discord.js");
const fetch = require("node-fetch");
const { log } = require("@llath/logger");

const { getTwitchOptions } = require("../OPTIONS");

/**
 *
 * @param {string} name
 * @param {Channel} channel
 * @returns
 */
const fetchClips = async (name, channel) => {
  console.log("DEBUG: fetchClips");
  const time = new Date(new Date().setDate(new Date().getDate() - 1));

  const { data } = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${name}&started_at=${time.toISOString()}`,
    await getTwitchOptions()
  )
    .then((data) => data.json())
    .then((v) => {
      console.log(v);
      return v;
    })
    .catch((err) => log(err, "error"));

  if (data === undefined || data?.length < 1) {
    log("fetchClips data is undefined", "error");
    return;
  }

  const clipMessage = (clip) =>
    `${clip.broadcaster_name} - ${clip.title} \nCreator: ${
      clip.creator_name
    } \n${encodeURIComponent(clip.url)}`;

  channel.send(`Todays clips are:`);
  log(`Found ${data.length} clips for channel ${name}`, "info");

  data.map((clip) => {
    channel.send(`${clipMessage(clip)}`);
  });
};

module.exports = { fetchClips };
