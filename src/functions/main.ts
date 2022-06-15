import { Activity, Presence } from "discord.js";
import { Client } from "../client";
import party from "./party";
import send from './send';

export default async function(info: Presence, activity: Activity, client: Client) {
	const current = client.current.get(info.user?.id);

	const inParty = await party(info, activity, client);
	if (inParty) return;

	if (!current) {
		await send(info, activity, client);
	} else if (current.syncId === activity.syncId && !current.state) {
		current.state = true;
		client.current.set(info.user?.id, current);
	} else if (current.syncId !== activity.syncId) {
		await send(info, activity, client);
	}
}