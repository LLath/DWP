module.exports = {
  callback: (message, ...args) => {
    console.log(args);
    message.reply({ content: "pong", ephemeral: true });
  },
};
