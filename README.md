# Melody

An open source Discord bot for sharing Spotify presence to a given Discord channel.

### Note: MelodySE has been merged with this repository with improvements

## Features
- Song title, artist(s), album name, album cover and more
- Configuring state, channel, mode and users within Discord

## Instructions
1. Download and Install [NodeJS](https://nodejs.org)
2. Clone this repository: `git clone https://github.com/Zemyoro/Melody`
3. Set current directory: `cd Melody`
4. Install modules: `npm install`
5. Rename `template.env` to `.env`
6. Follow comments inside `.env` and fill the fields
7. Deploy Melody command: `npm run deploy:guild`
8. Start Melody: `npm start`

## Hosting locally
Install PM2: `npm install -g pm2` then start hosting Melody: `npm run host`

## Development
Start Melody: `npm run dev`

## Issues
If you encounter any issues not listed below, please report them [here](https://github.com/Zemyoro/Melody/issues).
- [Embed colors aren't appearing as expected](https://github.com/Automattic/node-canvas#compiling)