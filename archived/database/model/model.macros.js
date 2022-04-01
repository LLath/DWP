const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema(
  {
    user: String,
    macros: [
      {
        macro: String,
        command: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = DataSchema;
