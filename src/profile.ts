import { Activity, MessageEmbed, Presence } from 'discord.js';
import { Melody, Spotify } from './client';
import { getConfig } from './config';
import { getColorFromURL } from 'color-thief-node';

export default async function (presence: Presence, activity: Activity, melody: Melody) {
    if (!presence.user) return;

    const profile = melody.list.get(presence.user.id);
    const channel = await melody.channels.fetch(getConfig().channel).catch(() => null);
    if (!channel || channel.type !== 'GUILD_TEXT') return;

    for (const MelodyProfile of [...melody.list.values()]) {
        if (MelodyProfile.syncId === activity.syncId) {
            return await channel.messages.fetch(MelodyProfile.msg).then(msg => {
                if (!msg.embeds[0].footer?.text.includes(`${presence.user?.tag}`)) {
                    msg.embeds[0].footer = {
                        text: `${msg.embeds[0].footer?.text}, ${presence.user?.tag}`
                    }
                    msg.edit({ embeds: msg.embeds }).catch(() => null);
                }
            }).catch(() => null);
        }
    }

    if (profile && profile.syncId === activity.syncId && !profile.state) {
        profile.state = true;
        return melody.list.set(presence.user.id, profile);
    } else if (!profile || profile.syncId !== activity.syncId) {
        const songResponse = await Spotify.request(`https://api.spotify.com/v1/tracks/${activity.syncId}`);
        const artists: string[] = [];

        const embed = new MessageEmbed()
            .setTitle(songResponse.name)
            .setURL(songResponse.external_urls.spotify)
            .setThumbnail(songResponse.album.images[0].url)
            .setColor(await getColorFromURL(songResponse.album.images[songResponse.album.images.length - 1].url.split('?')[0]) || 'RANDOM')
            .setFooter({ text: `Playing for ${presence.user.tag}` })
            .setTimestamp();

        embed.addFields([
            {
                name: 'Monthly popularity',
                value: `${Math.trunc(songResponse.popularity / 10) || '?'} / 10`
            },
            {
                name: 'Album',
                value: songResponse.album.name
            }
        ]);

        for (const i in songResponse.album.artists) {
            artists[parseInt(i)] = songResponse.album.artists[i].name;
        }

        embed.addField('Artist(s)', artists.join('\n'));
        embed.addField('Release date', songResponse.album.release_date.replaceAll('-', '/'));

        return channel.send({ embeds: [embed] }).then(msg => {
            melody.list.set(`${presence.user?.id}`, {
                partyId: `${activity.party?.id}`,
                syncId: `${activity.syncId}`,
                state: true,
                msg: msg.id
            });
        });
    }
}