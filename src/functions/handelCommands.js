const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const clientId = '1363468873243951165'; 

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        for (folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const commandPath = `${path}/${folder}/${file}`;
                const commandSource = fs.readFileSync(commandPath, 'utf8');
                if (!/made by mack/i.test(commandSource)) {
                    console.warn(`Hey! This is a public github meaning it's not your proprety, please credit the author of the command ${file} with "// Made by Mack"`);
                    continue;
                }
                const command = require(`../commands/${folder}/${file}`);
                if (command && command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                }
            }
        }

        const rest = new REST({
            version: '9'
        }).setToken(process.env.token);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(clientId), {
                        body: client.commandArray
                    },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    };
};