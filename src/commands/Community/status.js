// Made by Mack
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { games } = require('../../schemas/main');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show the current Truth or Dare game status'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const game = games[guildId];
    if (!game) return interaction.reply('No Truth or Dare game is running.');
    const embed = new EmbedBuilder()
      .setTitle('Truth or Dare Game Status')
      .addFields(
        { name: 'Host', value: `<@${game.hostId}>`, inline: true },
        { name: 'Round', value: String(game.roundNumber || 1), inline: true },
        { name: 'Participants', value: game.participants.map(id => `<@${id}>`).join(', ') }
      )
      .setColor('Blue');
    if (game.selectedUsers && game.selectedUsers.length > 0) {
      embed.addFields({ name: 'Already Played This Round', value: game.selectedUsers.map(id => `<@${id}>`).join(', ') });
    }
    interaction.reply({ embeds: [embed] });
  }
};
