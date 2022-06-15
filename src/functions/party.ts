import { Activity, Presence } from "discord.js";
import { Client } from "../client";

export default async function (info: Presence, activity: Activity, client: Client) {
	if (!client.current.size) return;
	let party: any = null;

	for (const [key, value] of client.current) {
		if (value.syncId === activity.syncId) {
			party = await client.channel?.messages.fetch(value.msg).then(msg => {
				if (msg && msg.embeds[0].footer && !msg.embeds[0].footer.text.includes(`${info.user?.username}`)) {
					msg.embeds[0].footer.text = msg.embeds[0].footer.text += `, ${info.user?.username}`;
					msg.edit({ embeds: [msg.embeds[0]] });
				}
			}).catch(() => {
			});
		}
	}

	return party;
}