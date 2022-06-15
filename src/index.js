const { Client, spotify } = require('./client.js');
const { users, verbose } = require('./config.js');
const main = require('./functions/main.js');
require('dotenv').config();

const melody = new Client({ intents: ['GUILDS', 'GUILD_PRESENCES'] });

melody.on('presenceUpdate', async (info) => {
    if (info && info.user && users.includes(info.user.id)) {

        // Activities has the activity information of the user such as a game they're playing.
        const activities = info.guild.presences.cache.get(info.user.id).activities;

        // If the user is offline or has no activity, return.
        if (!activities) return;

        for (const activity of activities) {
            if (activity.id === 'spotify:1') await main(info, activity, melody);
        }
    }
});

melody.on('ready', async() => {
    console.log(`Logged in as ${melody.user.tag}!`);
    await melody.channels.fetch(process.env.CHANNEL).then(channel => {
        if (channel.type !== 'GUILD_TEXT')
            throw new Error('The provided channel is not a text channel!');

        melody.channel = channel;
        console.log(`Channel set to ${channel.name} (${channel.id})`)
    }).catch(e => console.error(e));
});

void melody.login(process.env.TOKEN);