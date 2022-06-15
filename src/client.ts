import { Client as client, Collection, TextChannel } from "discord.js";

export { Intents } from 'discord.js';
require('dotenv').config();

export class Client extends client {
	current: Collection<any, any>
	channel?: TextChannel

	constructor(options: any) {
		super(options);

		this.current = new Collection();
	}
}

const NodeSpotify = require('node-spotify-api');
export const spotify = new NodeSpotify({
	id: process.env.SPOTIFY_ID,
	secret: process.env.SPOTIFY_SECRET
});