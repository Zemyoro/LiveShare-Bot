// All-in-One module
// Created for Melody
// By Zemyoro

import { Activity, Presence, User } from 'discord.js';

export default function (activity: Activity, info: Presence) {
    return {
        user: info.user,
        partyId: activity.party?.id,
        syncId: activity.syncId
    } as AIO
}

export interface AIO {
    user: User | null;
    partyId: string | null;
    syncId: string;
}