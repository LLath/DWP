const { ToadScheduler, SimpleIntervalJob, Task } = require("toad-scheduler");
const { fetchClips } = require("./getClips");
const scheduler = new ToadScheduler();

/**
 * @async
 * @param {string} id twitch channel id
 * @param {Channel} channel DiscordJS channel
 */
const useSchedule = async (id, channel) => {
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
