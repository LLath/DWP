const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema(
  {
    id: String,
    changeSchedule: Boolean,
    type: String,
    runImmediately: Boolean,
    role: String,
    embedColor: Number,
  },
  { timestamps: true }
);

module.exports = DataSchema;
