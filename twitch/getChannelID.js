const { twitchOptions } = require("./OPTIONS");
const fetch = require("node-fetch");

// TODO: Does not need Channel -> logging

/**
 * Fetch UserID from Twitch by name
 *
 * @async
 * @param {string} name
 * @param {object} channel
 * @returns {Promise<object>} id: string, error: string
 */
const getChannelID = async (name) => {
  const returnObj = { id: "", error: "" };

  const { data } = await fetch(
    `https://api.twitch.tv/helix/users?login=${name}`,
    twitchOptions
  )
    .then((data) => data.json())
    .catch((err) => {
      console.log(err);
      returnObj.error = `An Error occured: ${err}`;
      return returnObj;
    });

  if (data === undefined || data[0]?.id === undefined) {
    returnObj.error = "User not found";
    return returnObj;
  }

  returnObj.id = data[0].id;

  return returnObj;
};

module.exports = { getChannelID };
