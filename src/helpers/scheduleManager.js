const cron = require("node-cron");

const schedules = {};

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
 * @property {boolean} changeSchedule
 * @property {string} type
 *
 */

const deleteJob = (job) => {
  console.log("Deleting job", schedules[job.type].length);
  job.task.stop();
  schedules[job.type].splice(
    schedules[job.type].findIndex((element) => element.id === job.id),
    1
  );
  console.log("End Deleting job", schedules[job.type].length);
};

/**
 *
 * @param {task} job
 *
 */
const changeSchedule = async (job) => {
  const schedule = schedules[job.type].find(
    (_schedule) => _schedule.id === job.id
  );
  deleteJob(schedule);
  await _createSchedule(job);
};

const _createSchedule = async (job) => {
  const duplicate = schedules[job.type]?.find(
    (schedule) => schedule.id === job.id
  );
  if (duplicate !== undefined) {
    console.log("INFO: Duplicate detected reusing job");
    deleteJob(duplicate);
  }

  if (schedules[job.type] === undefined) {
    schedules[job.type] = [];
  }
  let day = "*";
  let month = "*";
  let hour = job?.time?.hour;
  let minute = 0;

  if (job.changeSchedule) {
    const upcomingPromotions = await job.scheduleFn();
    day = new Date(upcomingPromotions[0]).getDate();
    month = new Date(upcomingPromotions[0]).getMonth() + 1;
    hour = new Date(upcomingPromotions[0]).getHours();
  } else {
    await job.scheduleFn();
  }

  // if (process.env.NODE_ENV === "dev") {
  //   day = "*";
  //   month = "*";
  //   hour = "*";
  //   minute = "*";
  // }

  const task = cron.schedule(
    `${minute} ${hour} ${day} ${month} *`,
    async () => {
      await job.scheduleFn();

      if (job.changeSchedule) {
        changeSchedule(job);
      }
    }
  );
  schedules[job.type].push({
    ...job,
    task,
    time: { day, month, hour, minute },
  });
  console.log(`INFO: creating a task ${job.type} #${job.id}`);
};
const getById = (id) => {
  return schedules.find((schedule) => schedule.id === id);
};

const _getStatus = () => {
  console.log(schedules);
  const messages = [];
  for (const type in schedules) {
    const jobIds = schedules[type].map(
      (job) => `
      <#${job.id}>`
    );
    messages.push(`Service: ${type}${jobIds.join("")}`);
  }
  return messages.join("\n");
};

module.exports = {
  /**
   * @param {task} job
   */
  createSchedule: async (job) => await _createSchedule(job),

  getAll: schedules,

  stopById: (id) => {
    deleteJob(getById(id));
    console.log(`Stopping task #${id}; there are ${schedules.length} active`);
  },

  getStatus: () => _getStatus(),
};
