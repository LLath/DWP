const cron = require("node-cron");
const { log } = require("@llath/logger");
const fetch = require("node-fetch");

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

const deleteJob = async (job) => {
  log("Deleting job " + schedules[job.type]?.length, "info");
  job.task.stop();
  schedules[job.type].splice(
    schedules[job.type].findIndex((element) => element.id === job.id),
    1
  );
  await fetch(
    `${process.env.API_V1}services/deleteItem/${job.type}/${job.id}`,
    {
      method: "DELETE",
    }
  );
  log("End Deleting job " + schedules[job.type].length, "info");
};

/**
 * @param {task} job
 */
const changeSchedule = async (job) => {
  const schedule = schedules[job.type].find(
    (_schedule) => _schedule.id === job.id
  );
  await deleteJob(schedule);
  await _createSchedule(job);
};

/**
 * @param {task} job
 */
const _createSchedule = async (job) => {
  const duplicate = schedules[job.type]?.find(
    (schedule) => schedule.id === job.id
  );
  const isConnected = await fetch(
    `${process.env.API_V1}services/isConnected`
  ).then((res) => res.json());
  if (isConnected) {
    if (duplicate === undefined) {
      // job.runImmediately = false;
      await fetch(`${process.env.API_V1}services/putItem/${job.type}`, {
        method: "PUT",
        body: JSON.stringify(job),
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  if (duplicate !== undefined) {
    log("Duplicate detected reusing job", "info");
    await deleteJob(duplicate);
  }

  if (schedules[job.type] === undefined) {
    schedules[job.type] = [];
  }
  let day = "*";
  let month = "*";
  let hour = job?.time?.hour;
  let minute = 0;

  console.log("DEBUG: JOB", job);
  if (job.changeSchedule) {
    const upcomingPromotions = await job.scheduleFn();
    console.log("upcomingPromotions:", upcomingPromotions);
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
  console.log(`min:${minute}; hour:${hour}; day:${day}; month:${month}`);
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
