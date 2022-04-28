const fetch = require("node-fetch");
const { log } = require("@llath/logger");

const { twitchOptions } = require("./OPTIONS");

/**
 * Fetch UserID from Twitch by name
 * @async
 * @param {string} name
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
      log(err, "error");
      returnObj.error = `An Error occured: ${err}`;
      return returnObj;
    });

  if (data === undefined || data[0]?.id === undefined) {
    returnObj.error = "User not found";
    return returnObj;
  }

  log(`found id ${data[0].id} for name ${name}`, "info");
  returnObj.id = data[0].id;

  return returnObj;
};

module.exports = { getChannelID };
