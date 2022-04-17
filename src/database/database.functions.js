const db = require("./connection").getDb;

async function findAll(type) {
  console.log("INFO: Find all database items");
  const results = await db.model(type, this.model).find();
  console.log("INFO end: Find all database items", results.length);
  return results;
}

async function findById(id) {
  console.log("Find database item");
  let result = null;

  try {
    result = await db.model(id, this.model).findOne();
  } catch (error) {
    console.log(error);
  }

  console.log("End finding database item");
  return result;
}

async function create(template) {
  console.log("Create item with:", template);

  const dbItem = db.model(template.type, this.model);

  await dbItem.findOneAndUpdate({ id: template.id }, template, {
    upsert: true,
    useFindAndModify: false,
  });

  console.log("Create Item finished");
}

/**
 *
 * @param {String} _model commandName
 * @returns Functions [findById, create, findAll] and model
 */
const useModel = (_model) => {
  const model = require(`./model/model.${_model}`);
  return { model, findById, create, findAll };
};

module.exports = { useModel };
