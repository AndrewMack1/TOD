const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { games } = require('../../schemas/main');

// Made by Mack
module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a participant from the Truth or Dare game')
        .addUserOption(option => option
            .setName("user")
            .setDescription("User to kick")
            .setRequired(true)
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const game = games[guildId];

        if (!game) {
            return interaction.reply('No Truth Or Dare game is currently in progress.');
        }

        if (game.hostId !== interaction.user.id) {
            return interaction.reply("Only the host can use the /kick command.");
        }

        const mentionedUser = interaction.options.getMember('user');

        if (!game.participants.includes(mentionedUser.id)) {
            return interaction.reply('The mentioned user is not a participant in the game.');
        }


        game.participants = game.participants.filter(userId => userId !== mentionedUser.id);

        try {

            await interaction.channel.permissionOverwrites.delete(mentionedUser.id);

            await interaction.channel.permissionOverwrites.create(mentionedUser.id, {
                deny: [PermissionsBitField.Flags.ViewChannel],
            });

            if (game.participants.length === 1) {
                const remainingUser = interaction.guild.members.cache.get(game.participants[0]);

                interaction.channel.send(`The Truth Or Dare game has ended. ${remainingUser.user.username} is the winner!`);

                setTimeout(async () => {
                    await interaction.channel.delete();
                }, 10000);
                delete games[guildId];
            }

            interaction.reply(`Successfully kicked <@${mentionedUser.id}> from the game.`);
        } catch (error) {
            console.error('Error modifying channel permissions:', error);
            interaction.reply('Error modifying channel permissions.');
        }
    },
};
