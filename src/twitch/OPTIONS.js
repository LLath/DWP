const fetch = require("node-fetch");
const { log } = require("@llath/logger")

const updateTwitchOptions = async () => {
  const response = await fetch(`${process.env.API_V1}auth/twitch/new`).then(res => res.text())
  log(`Updated twitchSecrets: ${response}`, "info")
}

const getTwitchOptions = async () => {
  const { access_token, token_type } = await fetch(`${process.env.API_V1}auth/twitch`).then(res => res.json())
  return ({
    headers: new fetch.Headers({
      Authorization: `${token_type} ${access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
    }),
  })
}

module.exports = { getTwitchOptions, updateTwitchOptions };
