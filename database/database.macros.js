const macros = require("./model/model.macros");

const find = async (db, id) => {
  console.log("Find database item");
  let result = null;

  try {
    result = await db.model(id, macros).findOne();
  } catch (error) {
    console.log(error);
  }

  console.log("End finding database item");
  return result;
};

const create = async (db, id, template, msg) => {
  console.log("Create item with:", template);

  const _macros = db.model(id, macros);
  const userItem = await _macros.findOne();

  if (userItem !== null) {
    userItem.macros.push(template.macros[0]);
    await userItem.save();
  } else {
    _macros.create(template);
  }

  console.log("Create Item finished");
};

module.exports = { create, find };
