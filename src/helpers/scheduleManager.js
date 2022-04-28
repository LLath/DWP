const cron = require("node-cron");
const { log } = require("@llath/logger");

const { useModel } = require("../database/database.functions");
const { isConnected } = require("../database/connection");

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
 * @property {boolean} runImmediately
 *
 */

const deleteJob = (job) => {
  log("Deleting job " + schedules[job.type]?.length, "info");
  const db = useModel(job.type);
  job.task.stop();
  schedules[job.type].splice(
    schedules[job.type].findIndex((element) => element.id === job.id),
    1
  );
  db.deleteById(job.type, job.id);
  log("End Deleting job " + schedules[job.type].length, "info");
};

/**
 * @param {task} job
 */
const changeSchedule = async (job) => {
  const schedule = schedules[job.type].find(
    (_schedule) => _schedule.id === job.id
  );
  deleteJob(schedule);
  await _createSchedule(job);
};

/**
 * @param {task} job
 */
const _createSchedule = async (job) => {
  const duplicate = schedules[job.type]?.find(
    (schedule) => schedule.id === job.id
  );
  if (isConnected()) {
    const db = useModel(job.type);
    if (duplicate === undefined) {
      job.runImmediately = false;
      await db.create(job);
    }
  }
  if (duplicate !== undefined) {
    log("Duplicate detected reusing job", "info");
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
  } else if (job.runImmediately) {
    await job.scheduleFn();
  }

  if (process.env.NODE_ENV === "dev") {
    day = "*";
    month = "*";
    hour = "*";
    minute = "*";
  }

  const task = cron.schedule(
    `${minute} ${hour} ${day} ${month} *`,
    async () => {
      if (job.changeSchedule) {
        changeSchedule(job);
      } else {
        await job.scheduleFn();
      }
    }
  );
  schedules[job.type].push({
    ...job,
    task,
    time: { day, month, hour, minute },
  });

  log(`creating a task ${job.type} #${job.id}`, "info");
};
const getById = (id) => {
  log(JSON.stringify(schedules), "info");
  for (const type in schedules) {
    return schedules[type].find((job) => job.id === id);
  }
};

const _getStatus = () => {
  log(schedules, "debug");
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

  stopById: (id) => {
    deleteJob(getById(id));
    log(`Stopping task #${id}; there are ${schedules.length} active`, "info");
  },

  getStatus: () => _getStatus(),
};
