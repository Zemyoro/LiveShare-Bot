const { Client, Intents, MessageEmbed } = require('discord.js');
const NodeSpotify = require('node-spotify-api');

const ShareChannel = '';
const Token = '';
const LiveShare = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });
const Spotify = new NodeSpotify({ id: '', secret: '' });

const Users = [];

let CurrentSong = [];
function SongEmbed (Info, user) {
    const Artists = [];
    let Embed = new MessageEmbed()
        .setTitle(`${Info.name}`)
        .setThumbnail(Info.album.images[0].url)
        .setTimestamp()

    Embed.setURL(Info["external_urls"]["spotify"]);
    Embed.addFields(
        {
            name: 'Monthly popularity',
            value: `${Math.trunc(Info["popularity"] / 10)} / 10`
        },
        {
            name: 'Album',
            value: Info['album'].name
        }
    )

    for (const i in Info.album["artists"]) {
        Artists[i] = Info.album["artists"][i].name;
    }

    if (Artists.length > 1) Embed.addField('Artist names', Artists.join('\n'))
    else Embed.addField('Artist name', Artists[0]);

    Embed.addField('Release date', `${Info['album']["release_date"]}\n(Year/Month/Day)`, true);
    Embed.setFooter({ text: `Playing for ${user.username}` });
    return Embed;
}

function PushDetails (Activity, info) {
    for (const i in CurrentSong) {
        if (CurrentSong[i].id === info.userId) {
            CurrentSong.splice(parseInt(i), 1);
        }
    }

    CurrentSong.push({
        id: info.userId,
        title: Activity.details,
        artist: Activity.state
    });
}

async function GetInformation (Activity) {
    return await Spotify.request(`https://api.spotify.com/v1/tracks/${Activity.syncId}`);
}

async function CommenceTheStinky (Activity, info, Channel) {
    const Response = await GetInformation(Activity)
    PushDetails(Activity, info);
    Channel.send({embeds: [SongEmbed(Response, info.user)]});
}

LiveShare.on('presenceUpdate', async (info) => {
    for (const User of Users) {
        if (info && info.userId === User) {
            const Guild = await LiveShare.guilds.fetch(info.guild.id);
            const Activities = Guild.presences.cache.get(info.userId).activities;
            if (!Activities) return;
            for (const Activity of Activities) {
                if (Activity.id === 'spotify:1') {
                    const Channel = await Guild.channels.fetch(ShareChannel);

                    if (!CurrentSong.length) {
                        const Response = await GetInformation(Activity)
                        PushDetails(Activity, info);
                        Channel.send({ embeds: [SongEmbed(Response, info.user)] });
                    } else {
                        for (const i in CurrentSong) {
                            if (Activity.details !== CurrentSong[i].title && CurrentSong[i].id === info.userId) {
                                await CommenceTheStinky(Activity, info, Channel);
                            } else if (parseInt(i) + 1 === CurrentSong.length && CurrentSong[i].id !== info.userId) {
                                await CommenceTheStinky(Activity, info, Channel);
                            }
                        }
                    }
                }
            }
        }
    }
});

LiveShare.login(Token).then(() => {
   console.log('Ready!');
});