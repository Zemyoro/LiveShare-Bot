# Melody
 Discord bot for sharing Spotify Discord presence to a guild channel.

## Note
 This Discord bot isn't finished and the code is a bit spooky tbh.

## Instructions
1. Make a copy of template.env and rename to .env<br>
e.g. `cp template.env .env`
2. Edit the .env file and fill in the required values<br>
e.g. `nano .env`
3. Edit the config.ts file and fill in the users IDs<br>
e.g. `nano src/config.ts`
4. `npm install` to install dependencies
5. `npm run start` to start the bot
6. `npm run host` to host the bot

## Updating
Every major update (e.g. 1.0.0, 2.0.0, 3.0.0, etc.) is recommended to do a fresh clone and follow [instructions](#instructions) if any problems occur.
1. Pull any changes: `git pull`
2. Install modules: `npm install`
3. Compile: `tsc`

## Known issues
* (Fixed) Pixman-1 error on Linux:<br>
`sudo apt install libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev`
* (In progress) Embed colors not matching (RPI)

## [JavaScript version](https://github.com/Zemyoro/Melody)
