import { Activity, ColorResolvable, MessageEmbed, Presence } from "discord.js";
import { getColorFromURL } from 'color-thief-node';
import { Client } from "../client";

export default async function (song: any, info: Presence, activity: Activity, client: Client) {
	let artists: any[] = [];

	const base = new MessageEmbed();
	base.setTimestamp();

	base.title = song.name || activity.details;
	base.url = song.external_urls ? song.external_urls.spotify : undefined;
	base.thumbnail = {
		url: song.album
			? song.album.images[0].url
			: `https://www.antidote71.com/wp-content/uploads/2018/11/spotify-logo.png`
	};

	const color = await getColorFromURL(song.album.images[song.album.images.length - 1].url.split('?')[0]).catch(() => null);
	base.setColor(color ? `${color}` as ColorResolvable : 'RANDOM');

	base.addFields(
		{
			name: 'Monthly popularity',
			value: `${song.popularity ? Math.trunc(song.popularity / 10) : '?'} / 10`,
		},
		{
			name: 'Album',
			value: song.album ? song.album.name : `${activity.assets && activity.assets.largeText ? activity.assets.largeText : 'Unknown'}`
		}
	);

	if (song.album) {
		for (const i in song.album.artists) artists[parseInt(i)] = song.album.artists[i].name;
		if (artists.length > 1) base.addField('Artists', artists.join('\n'));
		else base.addField('Artist', artists[0]);

		base.addField('Release date', `${song.album.release_date.replaceAll('-', '/')}`, true);
	} else base.addField('Artist', `${activity.state || 'Unknown'}`);

	base.setFooter({ text: `Playing for ${info.user?.username}` });
	return base;
}