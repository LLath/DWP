const fetch = require("node-fetch");

const twitchOptions = {
  headers: new fetch.Headers({
    Authorization: `Bearer ${process.env.TWITCH_API}`,
    "Client-Id": process.env.TWITCH_CLIENT_ID,
  }),
};

module.exports = { twitchOptions };
