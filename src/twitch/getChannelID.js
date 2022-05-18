const fetch = require("node-fetch");
const { log } = require("@llath/logger");

const { getTwitchOptions, updateTwitchOptions } = require("./OPTIONS");

let retries = 3
/**
 * Fetch UserID from Twitch by name
 * @async
 * @param {string} name
 * @returns {Promise<object>} id: string, error: string
 */
const getChannelID = async (name) => {
  const returnObj = { id: "", error: {} };
  const headers = await getTwitchOptions()
  const { data } = await fetch(
    `https://api.twitch.tv/helix/users?login=${name}`, headers)
    .then((data) => data.json())
    .catch((err) => {
      log(err, "error");
      returnObj.error.statusCode = 401
      returnObj.error.message = `An Error occured: ${err}`;
      return returnObj;
    });

  if (data === undefined) {
    returnObj.error.statusCode = 401
    returnObj.error.message = "Userdata not found";
  }

  if (retries === 0) {
    log("Can't get new twitch token", "error")
    returnObj.error.statusCode = 500
    returnObj.error.message = "Ran out of retries for fetching twitch token"
    retries = 3
    return returnObj
  }

  if (returnObj.error.statusCode === 401) {
    log("Retrying fetching twitchname id", "info")
    await updateTwitchOptions()
    retries--
    return await getChannelID(name)
  }

  log(`found id ${data[0].id} for name ${name}`, "info");
  returnObj.id = data[0].id;
  retries = 3
  return returnObj;
};

module.exports = { getChannelID };
