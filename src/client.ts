import { Client, ClientOptions, Collection, TextChannel } from 'discord.js';
import 'dotenv/config';

export class Melody extends Client {
    list: Collection<string, MelodyProfile>;
    channel?: TextChannel;
    VERBOSE: boolean;
    USERS: string[];
    constructor(options: ClientOptions) {
        super(options);

        this.list = new Collection();

        this.VERBOSE = (process.env.VERBOSE === 'true') || false;
        this.USERS = process.env.USERS?.split(' ') || [];
    }
}

export { Activity } from 'discord.js';
export const Spotify = new (require('node-spotify-api'))({
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
});

export interface MelodyProfile {
    syncId: string;
    partyId: string | null;
    state: boolean;
    msg: string
}