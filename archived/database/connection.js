const mongoose = require("mongoose");
require("dotenv").config();
try {
  mongoose.connect(`${process.env.MONGODB}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: false,
  });
} catch (error) {
  mongoose.connection.on("error", (err) => {
    console.log("Database connection error:", err);
  });
}

mongoose.connection.once("open", () => {
  console.log("Connected to Database!");
});

module.exports = mongoose.connection;
