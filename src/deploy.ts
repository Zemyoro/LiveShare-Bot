import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import 'dotenv/config';

const method = process.argv[2];
const rest = new REST().setToken(process.env.TOKEN as string);
const guildId = process.env.TESTING_GUILD_ID as string;
const clientId = process.env.CLIENT_ID as string;

const melody = new SlashCommandBuilder()
    .setName('melody')
    .setDescription('Configure Melody')

const melodyJSON = melody.toJSON();

(async () => {
    try {
        switch (method) {
            case 'guild':
                console.log('Started refreshing application (/) melody command for GUILD.');
                await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [melodyJSON] });
                break;
            case 'global':
                console.log('Started refreshing application (/) melody command GLOBALLY.');
                await rest.put(Routes.applicationCommands(clientId), { body: [melodyJSON] });
                break;
            default:
                console.log('Failed to start application (/) melody command refresh.');
                break;
        }
        console.log('Successfully reloaded application (/) melody command.');
    } catch (error) {
        console.error(error);
    }
})();