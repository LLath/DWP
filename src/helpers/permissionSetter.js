const { Client } = require("discord.js");
const fetch = require("node-fetch");

const { PermissionFlagsBits } = require("discord-api-types/v9");

// FIXME:
/**
 *
 * @param {Client} client
 */
const permissionSetter = async (client) => {
  const guilds = client.guilds.cache.map((guild) => guild);

  const commands = await fetch(
    "https://discord.com/api/v9/applications/704270215856259073/commands",
    {
      headers: new fetch.Headers({
        Authorization: `Bot ${process.env.TOKEN}`,
      }),
    }
  ).then((response) => response.json());

  const devServer = guilds.find((guild) => guild.name === "Llath's server");

  devServer.commands.permissions.set;
  console.log("DEBUG: permissions", commands);

  guilds.forEach(async (guild) => {
    const moderationRoles = guild.roles.cache.filter((v) =>
      v.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
    // const commands = guild.commands.cache.find(
    //   (_command) => _command.name === command.name
    // );

    // moderationRoles.forEach(async (role) => {
    //   await guild.commands.permissions.set({
    //     fullPermissions: [
    //       {
    //         id: command.id,
    //         permissions: [
    //           {
    //             id: role.id,
    //             type: "ROLE",
    //             permission: true,
    //           },
    //         ],
    //       },
    //     ],
    //   });
    // });
    console.log(
      `INFO: permissions of command / were set to ${moderationRoles
        .map((role) => role.name)
        .join(", ")}`
    );
  });
};

module.exports = { permissionSetter };
