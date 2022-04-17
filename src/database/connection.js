const mongoose = require("mongoose");

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
  console.log("Connected to Database!");
});

module.exports = {
  connect: async () => await _connect(),
  getDb: mongoose.connection,
};
