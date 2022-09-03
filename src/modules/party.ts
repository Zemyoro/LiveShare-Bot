// Party module
// Created for Melody
// By Zemyoro

import { Melody } from '../client';
import { AIO } from './aio';

export default async function (info: AIO, client: Melody) {
    if (!client.list.size) return false;
    let party = false;

    for (const profile of [...client.list.values()]) {
        if (profile.syncId === info.syncId) {
            party = true;
            await client.channel?.messages.fetch(profile.msg).then(msg => {
                if (!msg.embeds[0].footer?.text.includes(`${info.user?.username}`)) {
                    msg.embeds[0].footer = {
                        text: `${msg.embeds[0].footer?.text}, ${info.user?.username}`
                    }
                    msg.edit({ embeds: msg.embeds });
                }
            }).catch(() => null);
        }
    }

    return party;
}