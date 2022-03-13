const fetch = require("node-fetch");

const { twitchOptions } = require("./OPTIONS");

const fetchClips = async (name, channel) => {
  const time = new Date(new Date().setDate(new Date().getDate() - 1));
  console.log(time);

  const { data } = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${name}&started_at=${time.toISOString()}`,
    twitchOptions
  )
    .then((data) => data.json())
    .catch((err) => console.log(err));

  if (data === undefined || data?.length < 1) {
    return;
  }

  const clipMessage = (clip) =>
    `${clip.broadcaster_name} - ${clip.title} \nCreator: ${clip.creator_name} \n${clip.url}`;

  channel.send(`Todays clips are:`);

  data.map((clip) => {
    channel.send(`${clipMessage(clip)}`);
  });
};

module.exports = { fetchClips };
