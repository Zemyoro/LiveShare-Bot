import { Activity, MessageEmbed, Presence } from "discord.js";
import { Client } from "../client";

const { getColorFromURL } = require('color-thief-node');

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

	try {
		let color = await getColorFromURL(song.album.images[song.album.images.length - 1].url.split('?')[0]);
		console.log(color);

		function hex(c: number) { return c.toString(16).length == 1 ? '0' + c.toString(16) : c.toString(16) }
		function converter(r: number, g: number, b: number) {
			const color = `#` + `${hex(r)}${hex(g)}${hex(b)}`
			return parseInt(color.replace('#', '0x'));
		}

		base.setColor(converter(color[0], color[1], color[2]));
	} catch (e) {
		base.setColor('#ffffff');
	}

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