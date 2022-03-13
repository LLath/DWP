const { ToadScheduler, SimpleIntervalJob, Task } = require("toad-scheduler");
const { fetchClips } = require("./getClips");
const { getChannelID } = require("./getChannelID");

const useSchedule = async (name, channel, array) => {
  const getScheduler = async () => {
    name = await getChannelID(name, channel.id);
    const findSchedule = array.find((item) => item.id === channel.id);
    if (findSchedule === undefined) {
      scheduler = new ToadScheduler();
      const scheduleObj = { scheduler, id: channel.id, name };
      array.push(scheduleObj);
      return scheduleObj;
    }
    return findSchedule;
  };

  const findSchedule = await getScheduler(array, channel);

  const scheduleTask = () => {
    const task = new Task("simple task", () => {
      fetchClips(name, channel);
    });
    const job = new SimpleIntervalJob({ days: 1 }, task);

    findSchedule.scheduler.addSimpleIntervalJob(job);
  };

  scheduleTask(scheduler);
};

module.exports = { useSchedule };
