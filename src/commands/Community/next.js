const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { games } = require('../../schemas/main');
const prompts = require('../../prompts');
// Made by Mack
async function runNextPlayer(interaction) {
        const guildId = interaction.guild.id;
        const game = games[guildId];

        if (!game) {
            return interaction.reply('No Truth Or Dare game is currently in progress.');
        }

        if (game.hostId !== interaction.user.id) {
            return interaction.reply("Only the host can proceed to the next round.");
        }

        const participants = game.participants;
        const selectedUsers = game.selectedUsers || [];
        const roundNumber = game.roundNumber || 1;
        if (!game.answers) game.answers = [];

        if (selectedUsers.length === participants.length) {

            game.selectedUsers = [];
            game.roundNumber += 1;

            const roundEmbed = new EmbedBuilder()
                .setTitle(`Round ${roundNumber + 1}!`)
                .setDescription('Let the game continue!')
                .setColor("Green");

            interaction.reply({ embeds: [roundEmbed] });

            setTimeout(() => {
                interaction.client.commands.get('next').execute(interaction);
            }, 2000);
            return;
        }

        let selectedUser;
        do {
            selectedUser = participants[Math.floor(Math.random() * participants.length)];
        } while (selectedUsers.includes(selectedUser));


        game.selectedUsers.push(selectedUser);

        const selectedUserEmbed = new EmbedBuilder()
            .setTitle('User Selected!')
            .setDescription(`The selected user for this round is: <@${selectedUser}>\n**Truth Or Dare?**`)
            .setColor("Green");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('choose_truth')
                .setLabel('Truth')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('choose_dare')
                .setLabel('Dare')
                .setStyle(ButtonStyle.Danger)
        );

        let replied = false;
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ embeds: [selectedUserEmbed], components: [row] });
            replied = true;
        } else {
            await interaction.followUp({ embeds: [selectedUserEmbed], components: [row] });
        }

        const message = replied ? await interaction.fetchReply() : (await interaction.fetchReply());
        const filter = i => i.user.id === selectedUser && (i.customId === 'choose_truth' || i.customId === 'choose_dare');
        const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            let prompt, type;
            if (i.customId === 'choose_truth') {
                prompt = prompts.truths[Math.floor(Math.random() * prompts.truths.length)];
                type = 'Truth';
            } else {
                prompt = prompts.dares[Math.floor(Math.random() * prompts.dares.length)];
                type = 'Dare';
            }
            const prefix = type === 'Truth' ? 'Truth' : 'Dare';
            await i.reply({ content: `${prefix}: ${prompt}\n<@${selectedUser}>, please reply with your answer in the chat.`, ephemeral: false });


            const answerFilter = m => m.author.id === selectedUser;
            const msgCollector = i.channel.createMessageCollector({ filter: answerFilter, max: 1, time: 120000 });
            msgCollector.on('collect', msg => {

                game.answers.push({
                    user: selectedUser,
                    round: game.roundNumber,
                    type,
                    prompt,
                    answer: msg.content
                });
                msg.reply('Answer recorded! Moving to the next player...');
            });
            msgCollector.on('end', (collected) => {

                setTimeout(() => {
                    interaction.client.commands.get('next').execute(interaction);
                }, 2000);
            });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: `<@${selectedUser}> did not choose in time. Moving to the next player.`, ephemeral: false });
                setTimeout(() => {
                    interaction.client.commands.get('next').execute(interaction);
                }, 2000);
            }
        });
}

module.exports = { runNextPlayer };
