const roll = (msg, modify) => {
  let result = 0;
  let dice = [];
  let help_modify = modify;
  modify.forEach((_dice, index) => {
    if (_dice.includes("+")) {
      help_modify = modify[index].slice(1);
      result += parseInt(help_modify);
    }
    if (_dice.includes("d")) {
      const sides = modify[index].split("d")[1];
      const numberOfDice = modify[index].split("d")[0];
      for (let i = 0; i < numberOfDice; i++) {
        let number = Math.floor(Math.random() * sides + 1);
        result += number;
        dice.push(number);
      }
    }
  });
  msg.reply(`\n result: ${result} \n [${dice}]`);
};

module.exports = roll;
