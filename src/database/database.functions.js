const db = require("./connection").getDb;
const { log } = require("@llath/logger");

async function findAll(type) {
  log("Find all database items for " + type, "info");
  const results = await db.model(type, this.model).find();
  log("End: Find all database items " + results.length, "info");
  return results;
}

async function findById(id) {
  log("Find database item", "info");
  let result = null;

  try {
    result = await db.model(id, this.model).findOne();
  } catch (error) {
    log(error, "error");
  }

  log("End finding database item", "info");
  return result;
}

async function deleteById(type, id) {
  log("Deleting database item " + id, "info");

  try {
    const dbItem = db.model(type, this.model);
    await dbItem.findOneAndRemove({ id });
  } catch (error) {
    log(error, "error");
  }

  log("End deleting database item", "info");
}

async function create(template) {
  log("Create item with:" + template, "info");

  const dbItem = db.model(template.type, this.model);

  await dbItem.findOneAndUpdate({ id: template.id }, template, {
    upsert: true,
    useFindAndModify: false,
  });

  log("Create Item finished", "info");
}

/**
 *
 * @param {String} _model commandName
 * @returns Functions [deleteById, create, findAll] and model
 */
const useModel = (_model) => {
  if (process.env.NODE_ENV === "dev") {
    _model = _model.replace(/dev$/g, "");
  }
  const model = require(`./model/model.${_model}`);
  return { model, create, findAll, deleteById };
};

module.exports = { useModel };
