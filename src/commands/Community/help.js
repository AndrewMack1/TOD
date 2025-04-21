// Made by Mack
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help for Truth or Dare bot'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Truth or Dare Bot Commands')
      .setDescription('Here are the available commands:')
      .addFields(
        { name: '/start', value: 'Start a new Truth or Dare game' },
        { name: '/join', value: 'Join a running game' },
        { name: '/leave', value: 'Leave the game' },
        { name: '/next', value: 'Proceed to the next round (host only)' },
        { name: '/kick', value: 'Kick a participant (host only)' },
        { name: '/stop', value: 'Stop the game (host only)' },
        { name: '/status', value: 'Show current game status' },
      )
      .setColor('Gold');
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
