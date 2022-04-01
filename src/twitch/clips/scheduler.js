const { ToadScheduler, SimpleIntervalJob, Task } = require("toad-scheduler");
const { fetchClips } = require("./getClips");
const { getChannelID } = require("../getChannelID");
const scheduler = new ToadScheduler();

/**
 * @async
 * @param {string} name twitch channel name
 * @param {Channel} channel DiscordJS channel
 */
const useSchedule = async (name, channel) => {
  const { id, error } = await getChannelID(name);
  if (error) {
    console.log(error);
    channel.send(`An Error occured while fetching twitch id: ${error}`);
  }

  let runningJob = undefined;
  try {
    runningJob = scheduler.getById(channel.id);
  } catch (error) {
    console.log(
      `Job with an id ${channel.id} is not registered, creating new Job.`
    );
  }

  if (runningJob !== undefined) {
    scheduler.removeById(channel.id);
  }

  const task = new Task("simple task", () => {
    fetchClips(id, channel);
  });
  const job = new SimpleIntervalJob(
    { days: 1, runImmediately: true },
    task,
    channel.id
  );

  scheduler.addSimpleIntervalJob(job);
};

module.exports = { useSchedule, scheduler };
