// Made by Mack
const { SlashCommandBuilder } = require('discord.js');
const { games } = require('../../schemas/main');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the current Truth or Dare game'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const game = games[guildId];
    if (!game) return interaction.reply('No Truth or Dare game is running.');
    if (!game.participants.includes(interaction.user.id)) return interaction.reply('You are not in the game!');
    game.participants = game.participants.filter(id => id !== interaction.user.id);
    if (game.selectedUsers) game.selectedUsers = game.selectedUsers.filter(id => id !== interaction.user.id);
    if (game.participants.length === 0) {
      delete games[guildId];
      return interaction.reply('You left and the game has ended (no participants left).');
    }
    if (game.hostId === interaction.user.id) {
      game.hostId = game.participants[0];
      interaction.channel.send(`<@${game.hostId}> is now the host!`);
    }
    interaction.reply('You have left the game.');
  }
};
