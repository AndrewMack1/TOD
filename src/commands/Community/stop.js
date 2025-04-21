// Made by Mack
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { games } = require('../../schemas/main');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the current game of TOD'),

    async execute(interaction) {
        if (!interaction.member.roles.cache.find(r => r.id === '1363469463420141718')) {
            return interaction.reply("You don't have permission to use this command.");
        }

        const guildId = interaction.guild.id;
        if (games[guildId]) {
            delete games[guildId];
            interaction.reply('The Truth Or Dare game has been stopped and the data cleared.');
        } else {
            interaction.reply('No Truth Or Dare game is currently in progress in this server.');
        }
    },
};