const colors = {
  AQUA: "#1ABC9C",
  DARK_AQUA: "#11806A",
  GREEN: "#2ECC71",
  DARK_GREEN: "#1F8B4C",
  BLUE: "#3498DB",
  DARK_BLUE: "#206694",
  PURPLE: "#9B59B6",
  DARK_PURPLE: "#71368A",
  LUMINOUS_VIVID_PINK: "#E91E63",
  DARK_VIVID_PINK: "#AD1457",
  GOLD: "#F1C40F",
  DARK_GOLD: "#C27C0E",
  ORANGE: "#E67E22",
  DARK_ORANGE: "#A84300",
  RED: "#E74C3C",
  DARK_RED: "#992D22",
  NAVY: "#34495E",
  DARK_NAVY: "#2C3E50",
  YELLOW: "#FFFF00",
  BLURPLE: "#7289DA",
  GREYPLE: "#99AAB5",
  FUSCHIA: "#EB459E",
  BLACK: "#23272A",
};

module.exports = {
  ...colors,
  getColors: () =>
    Object.keys(colors).map((color) => ({
      name: color,
      value: colors[color],
    })),
};
