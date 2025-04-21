// Made by Mack
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { games } = require('../../schemas/main');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('answers')
    .setDescription('Show all Truth or Dare answers for this game'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const game = games[guildId];
    if (!game || !game.answers || game.answers.length === 0) {
      return interaction.reply('No answers have been recorded yet.');
    }

    const grouped = {};
    for (const ans of game.answers) {
      if (!grouped[ans.round]) grouped[ans.round] = [];
      grouped[ans.round].push(ans);
    }
    const embed = new EmbedBuilder()
      .setTitle('Truth or Dare Answers')
      .setColor('Purple');
    for (const round of Object.keys(grouped)) {
      let value = grouped[round].map(a => `**<@${a.user}>** (${a.type}): ${a.prompt}\n> ${a.answer}`).join('\n\n');
      embed.addFields({ name: `Round ${round}`, value: value.length > 1024 ? value.slice(0,1020) + '...' : value });
    }
    interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
