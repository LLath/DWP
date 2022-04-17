const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema(
  {
    id: String,
    type: String,
    runImmediately: Boolean,
    time: { hour: Number },
    name: String,
  },
  { timestamps: true }
);

module.exports = DataSchema;
