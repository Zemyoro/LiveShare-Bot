import { Activity, Presence } from "discord.js";
import { Client } from "../client";
import { spotify } from "../client";
import * as config from '../config';
import embed from "./embed";

export default async function (info: Presence, activity: Activity, client: Client) {
	let response: any = null;
	if (activity.syncId)
		response = await spotify.request(`https://api.spotify.com/v1/tracks/${activity.syncId}`);

	let songEmbed = await embed(response, info, activity, client);

	return await client.channel?.send({ embeds: [songEmbed] }).then(msg => {
		if (config.verbose) console.log(`${info.user?.tag} is listening to: ${response.name || activity.details}`);
		client.current.set(info.userId, {
			syncId: activity.syncId,
			state: true,
			msg: msg.id
		});
	});
}