const { Client, CommandInteraction } = require("discord.js");

const { PermissionFlagsBits } = require("discord-api-types/v9");

// FIXME:
/**
 *
 * @param {Client} client
 * @param {} command
 */
const permissionSetter = async (client, command) => {
  const guilds = client.guilds.cache.map((guild) => guild);

  guilds.forEach(async (guild) => {
    const moderationRoles = guild.roles.cache.filter((v) =>
      v.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
    const commands = guild.commands.cache.find(
      (_command) => _command.name === command.name
    );
    console.dir(guild.commands.cache.size);
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
      `INFO: permissions of command /${
        command.name
      } were set to ${moderationRoles.map((role) => role.name).join(", ")}`
    );
  });
};

module.exports = { permissionSetter };
