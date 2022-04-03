const cron = require("node-cron");

const schedules = [];

/**
 *
 * @async
 * @callback scheduleFn
 * @return {Promise<object>}
 *
 */

/**
 *
 * @typedef task
 * @type {object}
 * @property {string} id
 * @property {scheduleFn} scheduleFn
 *
 */

const deleteJob = (job) => {
  console.log("Deleting job", schedules.length);
  job.task.stop();
  schedules.splice(
    schedules.findIndex((element) => element.id === job.id),
    1
  );
  console.log("End Deleting job", schedules.length);
};

/**
 *
 * @param {task} job
 *
 */
const changeSchedule = async (job) => {
  const schedule = schedules.find((_schedule) => _schedule.id === job.id);
  deleteJob(schedule);
  await _createSchedule(job);
};

const _createSchedule = async (job) => {
  const duplicate = schedules.find((schedule) => schedule.id === job.id);
  if (duplicate !== undefined) {
    console.log("INFO: Duplicate detected reusing job");
    deleteJob(duplicate);
  }
  let upcomingPromotions = await job.scheduleFn();
  let day = new Date(upcomingPromotions[0]).getDay();
  let month = new Date(upcomingPromotions[0]).getMonth();
  let hour = new Date(upcomingPromotions[0]).getHours();

  if (process.env.NODE_ENV === "dev") {
    day = "3";
    month = "4";
    hour = "3";
  }
  const task = cron.schedule(`0 ${hour} ${day} ${month} *`, async () => {
    await job.scheduleFn();
    changeSchedule({ ...job, time: { day, month, hour } });
  });
  schedules.push({ ...job, task });
  console.log("INFO: creating a task", schedules.length);
};
const getById = (id) => {
  return schedules.find((schedule) => schedule.id === id);
};

module.exports = {
  /**
   *
   * @param {task} job
   * @returns
   *
   */
  createSchedule: async (job) => _createSchedule(job),

  getAll: schedules,

  stopById: (id) => {
    deleteJob(getById(id));
    console.log(`Stopping task #${id}; there are ${schedules.length} active`);
  },
};
