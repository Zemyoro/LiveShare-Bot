import { getColorFromURL } from 'color-thief-node';
import { Melody, Spotify } from '../client';
import { MessageEmbed } from 'discord.js';
import { AIO } from './aio';
import log from './log';

export default async function (info: AIO, client: Melody) {
    const response = await Spotify.request(`https://api.spotify.com/v1/tracks/${info.syncId}`);

    const artists: string[] = [];
    const embed = new MessageEmbed()
        .setTitle(response.name)
        .setURL(response.external_urls.spotify)
        .setThumbnail(response.album.images[0].url)
        .setColor(await getColorFromURL(response.album.images[response.album.images.length - 1].url.split('?')[0]) || 'RANDOM')
        .setFooter({ text: `Playing for ${info.user?.tag}` })
        .setTimestamp();

    embed.addFields([
        {
            name: 'Monthly popularity',
            value: `${Math.trunc(response.popularity / 10) || '?'} / 10`
        },
        {
            name: 'Album',
            value: response.album.name
        }
    ]);

    for (const i in response.album.artists) {
        artists[parseInt(i)] = response.album.artists[i].name;
    }

    embed.addField('Artists', artists.join('\n'));
    embed.addField('Release date', response.album.release_date.replaceAll('-', '/'));

    return client.channel?.send({ embeds: [embed] }).then(msg => {
        if (client.VERBOSE) console.log(`${info.user?.tag} is listening to: ${response.name} by ${artists.join(', ')}`)

        client.list.set(`${info.user?.id}`, {
            partyId: info.partyId,
            syncId: info.syncId,
            state: true,
            msg: msg.id
        });
    }).catch(() => {
        log('(Main) Failed to send message');
    });
}