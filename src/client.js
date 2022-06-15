const { Collection, TextChannel } = require('discord.js');
require('dotenv').config();

const client = require('discord.js');
module.exports.Client = class Client extends client {
    constructor(options) {
        super(options);

        this.current = new Collection();
        this.channel = TextChannel;
    }
}

const NodeSpotify = require('node-spotify-api');
module.exports.spotify = new NodeSpotify({
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
});