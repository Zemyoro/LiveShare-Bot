import { MessageEmbed } from 'discord.js';
import { Melody } from './client';
import party from './modules/party';
import aio from './modules/aio';
require('pretty-error').start();
import main from './modules';
import 'dotenv/config';

const melody = new Melody({ intents: ['GUILDS', 'GUILD_PRESENCES'] });

melody.on('presenceUpdate', async (info) => {
    if (info && info.user && melody.USERS?.includes(info.user.id)) {
        const activities = info.guild?.presences.cache.get(info.user.id)?.activities;
        if (!activities) {
            if (melody.VERBOSE) console.log(`${info.user.tag} is invisible or has no activity.`);
            return;
        }

        for (const activity of activities) {
            if (activity.id === 'spotify:1') {
                const profile = melody.list.get(info.user.id);
                const inParty = await party(aio(activity, info), melody);
                if (inParty) return;

                if (!profile || profile.syncId !== activity.syncId)
                    return main(aio(activity, info), melody);
                else if (profile.syncId === activity.syncId && !profile.state) {
                    profile.state = true;
                    melody.list.set(info.user.id, profile);
                }
            }
        }
    }
});

melody.on('ready', async () => {
    console.log(`Logged in as ${melody.user?.tag}!`);
    melody.user?.setActivity({ name: `${melody.USERS.length} members`, type: 'WATCHING' });
    await melody.channels.fetch(`${process.env.CHANNEL}`).then(channel => {
        if (!channel || channel?.type !== 'GUILD_TEXT')
            return console.log('The text channel provided is invalid.');

        melody.channel = channel;
        console.log(`Channel set to ${channel.name} (${channel.id})`);
    }).catch(e => console.log(e));
});

process.on('uncaughtException', (e) => {
    return error(e, true);
});

process.on('unhandledRejection', (e) => {
    return error(e as Error);
});

process.on('warning', (e) => {
    return error(e);
});

async function error(e: Error, exit?: boolean) {
    const eachMention = [];

    if (melody.USERS.length) {
        for (const user of melody.USERS) {
            eachMention.push(`<@${user}>`);
        }
    }

    console.log(e);
    await melody.channel?.send({
        content: `${eachMention.join(', ') || 'No one to mention.'}`, 
        embeds: [
            new MessageEmbed()
                .setTitle(`${e.message}`)
                .setDescription(`${exit ? 'Needs attention! Process exited.' : 'Handled by process. Functionality is limited.'}\n\`${e}\`\n\`${e.stack || 'No stack'}\``)
                .setColor('RED')
                .setTimestamp()
        ]
    });

    if (exit) process.exit(1);
}

void melody.login(process.env.TOKEN);