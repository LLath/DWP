const roll = (msg, modify) => {
  let plus = 0;
  let result = 0;
  const diceResult = [];
  const sides = [];
  const dice = [];
  const sign = [];
  modify.forEach((_dice, index) => {
    if ((_dice.includes("+") || _dice.includes("-")) && !_dice.includes("d")) {
      const help_modify = modify[index];
      result += parseInt(help_modify);
      plus += parseInt(help_modify);
    }
    if (_dice.includes("d")) {
      const _sides = modify[index].split("d")[1];
      const _sign =
        sign.length < 1 ? "" : modify[index].split("d")[0].charAt(0);
      const numberOfDice =
        modify[index].split("d")[0].replace(/[+-]/g, "") || 1;
      for (let i = 0; i < numberOfDice; i++) {
        let number = Math.floor(Math.random() * _sides + 1);
        if (sign === "-") {
          result -= number;
        } else {
          result += number;
        }
        diceResult.push(number);
      }
      sign.push(_sign);
      sides.push(_sides);
      dice.push(numberOfDice);
    }
  });
  console.log(modify);

  const diceShow = dice
    .map((d, index) => `${sign[index]} ${d}d${sides[index]} `)
    .toString();

  msg.reply(
    `\n rolled ${diceShow.replace(/,/g, "")} ${
      plus > 0 ? `+${plus}` : ""
    } \n dice: [${diceResult}] \n result: ${result}`
  );
};

module.exports = roll;
