// Made by Mack
const { SlashCommandBuilder } = require('discord.js');
const { games } = require('../../schemas/main');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join an ongoing Truth or Dare game'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const game = games[guildId];
    if (!game) return interaction.reply('No Truth or Dare game is running.');
    if (game.participants.includes(interaction.user.id)) return interaction.reply('You are already in the game!');
    game.participants.push(interaction.user.id);
    interaction.reply(`<@${interaction.user.id}> joined the game!`);
  }
};
