const { Client, Intents, MessageEmbed } = require('discord.js');
const NodeSpotify = require('node-spotify-api');

const ShareChannel = '';
const Token = '';
const LiveShare = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES] });
const Spotify = new NodeSpotify({ id: '', secret: '' });

const Users = [];

let CurrentSong = [];
function SongEmbed(Info, user) {
    const Artists = [];
    let Embed = new MessageEmbed()
        .setTitle(`${Info.name}`)
        .setThumbnail(Info.album.images[0].url)
        .setURL(Info["external_urls"]["spotify"])
        .setTimestamp();

    Embed.addFields(
        [
            {
                name: 'Monthly popularity',
                value: `${Math.trunc(Info["popularity"] / 10)} / 10`
            },
            {
                name: 'Album',
                value: Info['album'].name
            }
        ]
    );

    for (const i in Info.album["artists"]) Artists[i] = Info.album["artists"][i].name;
    if (Artists.length > 1) Embed.addField('Artist names', Artists.join('\n'))
    else Embed.addField('Artist name', Artists[0]);

    Embed.addField('Release date', `${Info['album']["release_date"].replaceAll('-', '/')}\n(Year/Month/Day)`, true);
    Embed.setFooter({ text: `Playing for ${user.username}` });
    return Embed;
}

function PushDetails(Activity, info, messageId) {
    for (const i in CurrentSong) {
        if (CurrentSong[i].id === info.userId) {
            CurrentSong.splice(parseInt(i), 1);
        }
    }

    CurrentSong.push({
        id: info.userId,
        title: Activity.details,
        artist: Activity.state,
        msgId: messageId
    });
}

async function CommenceTheStinky(Activity, info, Channel) {
    const Response = await Spotify.request(`https://api.spotify.com/v1/tracks/${Activity.syncId}`);
    await Channel.send({ embeds: [SongEmbed(Response, info.user)] }).then((msg) => {
        PushDetails(Activity, info, msg.id);
    });
}

async function PartyCheck(name, artist) {
    if (CurrentSong.length) {
        for (const i in CurrentSong) {
            if (CurrentSong[i].title === name
                && CurrentSong[i].artist === artist) {
                return CurrentSong[i].msgId;
            }
        }
    }
    return false;
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
                    const Party = await PartyCheck(Activity.details, Activity.state);

                    if (Party) {
                        const Messages = await Channel.messages.fetch();
                        let Message = Messages.get(Party);

                        if (Message) {
                            if (!Message.embeds[0].footer.text.includes(`${info.user.username}`)) {
                                Message.embeds[0].footer.text += `, ${info.user.username}`;
                                await Message.edit({embeds: [Message.embeds[0]]});
                            }
                        }
                    } else {
                        if (!CurrentSong.length) {
                            await CommenceTheStinky(Activity, info, Channel);
                        } else {
                            for (const i in CurrentSong) {
                                if (Activity.details !== CurrentSong[i].title && CurrentSong[i].id === info.userId) {
                                    await CommenceTheStinky(Activity, info, Channel);
                                } else if (parseInt(i) + 1 <= CurrentSong.length && CurrentSong[i].id !== info.userId) {
                                    await CommenceTheStinky(Activity, info, Channel);
                                }
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