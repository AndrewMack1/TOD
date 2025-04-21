// Made by Mack
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const { games } = require('../../schemas/main');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start a game of TOD'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.find(r => r.id === '1363469463420141718')) {
            return interaction.reply("You don't have permission to use this command.");
        }

        const guildId = interaction.guild.id;
        if (games[guildId]) {
            return interaction.reply('A Truth Or Dare game is already in progress in this server.');
        }

        games[guildId] = {
            guildId,
            hostId: interaction.user.id,
            participants: [interaction.user.id],
            selectedUsers: [],
            roundNumber: 1,
            channelId: null,
        };
        let game = games[guildId];

        const embed = new EmbedBuilder()
            .setTitle('Truth Or Dare Event')
            .setDescription(`Truth Or Dare event is being hosted by: <@${interaction.user.id}>`)
            .setColor('Blue');

        embed.addFields({
            name: 'Participants',
            value: `<@${interaction.user.id}> (Host)`,
        });

        const button = new ButtonBuilder()
            .setCustomId('join_tod_event')
            .setLabel('Join')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        const message = await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'join_tod_event' && i.user.id !== interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (!game.participants.includes(i.user.id)) {
                game.participants.push(i.user.id);
                embed.setFields({
                    name: 'Participants',
                    value: game.participants.map(userId => `<@${userId}>`).join(', '),
                });
                await message.edit({ embeds: [embed] });
                await i.deferUpdate(); 
            } else {
                await i.deferUpdate(); 
            }
        });

        collector.on('end', async () => {
            if (game.participants.length < 2) {
                embed.setTitle('Truth Or Dare Event Canceled');
                embed.setDescription('Not enough participants to start the game.');
                await message.edit({ embeds: [embed], components: [] });
                delete games[guildId];
                return;
            }

            await message.edit({ components: [] });

            const category = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === 'Admins');
            const channel = await interaction.guild.channels.create({
                name: `${interaction.user.username} room`,
                type: ChannelType.GuildText,
                parent: category,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    ...game.participants.map(userId => ({
                        id: userId,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    })),
                ],
            });

            game.channelId = channel.id; 

            const embed2 = new EmbedBuilder()
            .setTitle('Welcome')
            .setDescription('Before beginning, I will read out some rules.\n1. No talking if it isn\'t your turn\n2. No doing hard dares like { Do a face reveal, Do a voice reveal, etc}\n3. You MUST complete the truths / dares; otherwise, you will not be able to play anymore (get kicked from the round)\n \nThanks for choosing us! May the fun begin.\n\n**Truth or dare?** 😉 ')
            .setColor("Blue")
            channel.send({embeds: [embed2]});

            const { runNextPlayer } = require('./next');
            setTimeout(async () => {
                const fakeInteraction = {
                    guild: interaction.guild,
                    client: interaction.client,
                    channel,
                    user: interaction.user,
                    replied: false,
                    deferred: false,
                };
                await runNextPlayer(fakeInteraction);
            }, 2000);
        });
    },
};
