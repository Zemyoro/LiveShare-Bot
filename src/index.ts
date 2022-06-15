import { Client, Intents } from "./client";
import main from "./functions/main";
require('pretty-error').start();
import users from "./config";
import 'dotenv/config';

const melody = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES] });

melody.on('presenceUpdate', async (info) => {
	if (info && info.user && users.includes(info.user.id)) {

		// activities has the activity information of the user such as the game, the stream, etc.
		const activities = info.guild?.presences.cache.get(info.user.id)?.activities;

		// If the user is offline or has no activity, this will return.
		if (!activities) return;

		// For loop of the user's activities.
		for (const activity of activities) {
			if (activity.id === 'spotify:1') await main(info, activity, melody);
		}
	}
});

melody.on('ready', async (client) => {
	console.log(`Logged in as ${client.user.tag}!`);
	await client.channels.fetch(`${process.env.CHANNEL}`).then(channel => {
		if (channel?.type !== 'GUILD_TEXT')
			return console.log('This is not a text channel!');

		melody.channel = channel;
		console.log(`Channel set to ${channel?.name} (${channel?.id})`);
	}).catch(e => console.log(e));
});

void melody.login(process.env.TOKEN);