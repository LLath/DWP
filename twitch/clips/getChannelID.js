const { twitchOptions } = require("./OPTIONS");
const fetch = require("node-fetch");

const getChannelID = async (name, channel) => {
  const { data } = await fetch(
    `https://api.twitch.tv/helix/users?login=${name}`,
    twitchOptions
  )
    .then((data) => data.json())
    .catch((err) => console.log(err));

  if (data === undefined || data[0]?.id === undefined) {
    channel.send("User not found");
  }

  return data[0].id;
};

module.exports = { getChannelID };
