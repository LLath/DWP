const mongoose = require("mongoose");
const { log } = require("@llath/logger");

let isConnected = false;

/**
 * @returns {Promise}
 */
const _connect = async () => {
  log(`trying to connect to ${process.env.MONGODB}`, "info");
  try {
    await mongoose.connect(`${process.env.MONGODB}`, {
      family: 4,
      useUnifiedTopology: true,
      autoIndex: false,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
  } catch (error) {
    log(`Failed to connect to mongodb ${error}`, "error");
  }
};

mongoose.pluralize(null);

mongoose.connection.once("open", () => {
  isConnected = true;
  log("Connected to Database!", "info");
});

module.exports = {
  connect: async () => await _connect(),
  isConnected: () => isConnected,
  getDb: mongoose.connection,
};
