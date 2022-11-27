import { Client, ClientOptions, Collection } from 'discord.js';
import 'dotenv/config';

export class Melody extends Client {
    data: Collection<string, any>; // Button and modal data
    list: Collection<string, MelodyProfile>; // List of members who've played music
    constructor(options: ClientOptions) {
        super(options);

        this.data = new Collection();
        this.list = new Collection()
    }
}

export const Spotify = new (require('node-spotify-api'))({
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
});

export interface MelodyProfile {
    syncId: string;
    partyId: string | null;
    state: boolean;
    msg: string;
}