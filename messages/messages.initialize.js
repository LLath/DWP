const path = require("path");

const HELP_MESSAGES = {
  help: {
    description: "List of all my commands",
  },
  stats: {
    description: "Stats and modifier",
    message: { files: [path.resolve("./pics/stats.png")] },
  },
  shellforge: {
    description: "Anfangsstadt der Abenteurer",
    message: `Shellforge \n https://www.worldanvil.com/w/dungeonworld-llath/map/0402bb7b-8426-4bb9-a593-a8f79e0e5467`,
  },
  moves: {
    description: "Movelist",
    message: `https://drive.google.com/file/d/1i_uSLzaIWO3yvm5eBYuk6mM_ohDtAVKx/view`,
  },
  sheets: {
    description: "Chractersheets",
    message:
      "https://drive.google.com/drive/folders/1YVs2Nx6FGd5ZZhqbgWERt0HhHLxdDmnd",
  },
  spoiler: {
    description: "Spoiler für nächsten Sonntag :)",
    message: {
      files: [path.resolve("./pics/spoiler1.jpg")],
    },
  },
  roll: {
    description: "Roll your dice",
    message: "",
  },
  dw: {
    description: "Use ?dw for more information",
    message: "",
  },
  macro: {
    description: 'Macro something like so ?macro "attack" "?roll 2d6 +2"',
    message: "",
  },
};

module.exports = HELP_MESSAGES;
