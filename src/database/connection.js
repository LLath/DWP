const mongoose = require("mongoose");

let isConnected = false;

/**
 * @returns {Promise}
 */
const _connect = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB}`, {
      family: 4,
      useUnifiedTopology: true,
      autoIndex: false,
      useNewUrlParser: true,
    });
  } catch (error) {
    mongoose.connection.on("error", (err) => {
      console.log("Database connection error:", err);
    });
  }
};

mongoose.connection.once("open", () => {
  isConnected = true;
  console.log("Connected to Database!");
});

module.exports = {
  connect: async () => await _connect(),
  isConnected,
  getDb: mongoose.connection,
};
