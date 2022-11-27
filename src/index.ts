import { Melody } from './client';
import 'dotenv/config';
import { getConfig, updateConfig } from './config';
import profile from './profile';
import {
    ButtonInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Modal,
    ModalSubmitInteraction, TextInputComponent
} from 'discord.js';

const melody = new Melody({
    intents: ['GUILDS', 'GUILD_PRESENCES'],
    allowedMentions: { parse: ['users'] }
});

melody.on('ready', () => {
    console.log(`${melody.user?.tag} is ready to share your melody!`);
    refreshPresence();
});

melody.on('presenceUpdate', async (presence) => {
    const config = getConfig();
    if (!presence || !presence.user || !config.state || !(config.members.includes(presence.user.id) || config.mode === 'all')) return;
    const activities = presence.guild?.presences.cache.get(presence.user.id)?.activities;
    if (!activities) return;

    for (const activity of activities) {
        if (activity.id === 'spotify:1') {
            await profile(presence, activity, melody);
            break;
        }
    }
});

melody.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'melody') {
            const reply = await interaction.reply({
                embeds: [refreshedMainEmbed()],
                components: [refreshedMainRow()],
                fetchReply: true
            });

            melody.data.set(reply.id, {
                id: interaction.user.id
            });
        }
    } else if (interaction.isButton()) {
        const button = melody.data.get(interaction.message.id);
        if (!button) return interaction.reply({
            content: 'This button seems to be unavailable. It may have passed Melody\'s memory timeout threshold or Melody has restarted.',
            ephemeral: true
        });

        try {
            return data(interaction, button)
        } catch (e) {
            return interaction.reply({
                content: 'Unfortunately, this button has an error. Contact the developers.'
            });
        }
    } else if (interaction.isModalSubmit()) {
        const modal = melody.data.get(interaction.customId.split('-')[0]);
        if (!modal) return interaction.reply({
            content: 'This modal seems to be unavailable. It may have passed Melody\'s memory timeout threshold or Melody has restarted.',
            ephemeral: true
        });

        try {
            return data(interaction, modal)
        } catch (e) {
            return interaction.reply({
                content: 'Unfortunately, this modal has an error. Contact the developers.'
            });
        }
    }
});

async function data(interaction: ButtonInteraction | ModalSubmitInteraction, data: any) {
    if (interaction.user.id !== data.id) {
        return interaction.reply({
            content: 'This does not belong to you. You shall execute the Melody command yourself in order to configure.',
            ephemeral: true
        });
    }

    const config = getConfig();

    if (interaction instanceof ButtonInteraction) {
        switch (interaction.customId) {
            case 'Toggle':
                config.state = !config.state;
                updateConfig(config);

                return interaction.update({ embeds: [refreshedMainEmbed()], components: [refreshedMainRow()] });
            case 'Channel':
                const ChannelModal = new Modal()
                    .setTitle('Configure Melody channel')
                    .setCustomId(`${interaction.message.id}-Channel`)
                    // @ts-ignore
                    .setComponents([
                        // @ts-ignore
                        new MessageActionRow().setComponents([
                            new TextInputComponent()
                                .setCustomId('Channel')
                                .setLabel('Channel (e.g 123456789101112')
                                .setStyle('SHORT')
                                .setPlaceholder('0000000000000000')
                                .setRequired(true)
                        ])
                    ]);

                return interaction.showModal(ChannelModal);
            case 'Member':
                const MemberModal = new Modal()
                    .setTitle('Configure Melody members')
                    .setCustomId(`${interaction.message.id}-Member`)
                    // @ts-ignore
                    .setComponents([
                        // @ts-ignore
                        new MessageActionRow().setComponents([
                            new TextInputComponent()
                                .setCustomId('Members')
                                .setLabel('Member(s) (e.g. 123456789101112)')
                                .setStyle('PARAGRAPH')
                                .setPlaceholder('Multiple members can be add/removed at once with spaces between each.')
                                .setRequired(true)
                        ])
                    ]);

                return interaction.showModal(MemberModal);
            case 'Mode':
                config.mode = config.mode === 'all' ? 'list' : 'all';
                updateConfig(config);

                refreshPresence()
                return interaction.update({ embeds: [refreshedMainEmbed()], components: [refreshedMainRow()] });
        }
    } else {
        switch (interaction.customId.split('-')[1]) {
            case 'Channel':
                const channel = interaction.fields.getField('Channel').value;

                if (channel) {
                    const verifiedChannel = await melody.channels.fetch(channel).catch(() => null);
                    if (!verifiedChannel || verifiedChannel.type !== 'GUILD_TEXT') return interaction.reply({
                        content: `\`${channel}\` is not a valid channel. Please try again.`
                    });

                    config.channel = verifiedChannel.id;
                    updateConfig(config);

                    // @ts-ignore
                    await interaction.message.edit({ embeds: [refreshedMainEmbed()], components: [refreshedMainRow()] });

                    return interaction.reply({
                        content: `Melody's channel has successfully been set to <#${channel}>`,
                        ephemeral: true
                    });
                } else return;
            case 'Member':
                let members: string | string[] = interaction.fields.getField('Members').value;

                if (members) {
                    members = members.replace('\n', ' ');
                    members = members.split(' ');
                    const invalid = [];
                    const added = [];
                    const removed = [];
                    let result = '';

                    for (const member of members) {
                        const verifiedMember = interaction.guild?.members.fetch(member).catch(() => null);
                        if (verifiedMember) {
                            if (config.members.includes(member)) {
                                config.members.splice(config.members.indexOf(member), 1);
                                updateConfig(config);
                                removed.push(`<@!${member}>`);
                            } else {
                                config.members.push(member);
                                updateConfig(config);
                                added.push(`<@!${member}>`);
                            }
                        } else {
                            if (config.members.includes(member)) {
                                config.members.splice(config.members.indexOf(member), 1);
                                updateConfig(config);
                                removed.push(member);
                            } else {
                                invalid.push(member);
                            }
                        }
                    }

                    if (added.length) {
                        result = `Added ${added.join(', ')}`;
                    }

                    if (removed.length) {
                        result = `${result}\nRemoved ${removed.join(', ')}`;
                    }

                    if (invalid.length) {
                        result = `${result}\nUnable to add ${invalid.join(', ')}`;
                    }

                    // @ts-ignore
                    await interaction.message.edit({ embeds: [refreshedMainEmbed()], components: [refreshedMainRow()] });

                    return interaction.reply({
                        content: result,
                        ephemeral: true
                    });
                } else return;
        }
    }
}

function refreshedMainEmbed() {
    const config = getConfig();
    const members = [];

    if (config.members.length) {
        for (const member of config.members) {
            if (!member.length) continue;
            members.push(`<@!${member}>`);
        }
    }

    return new MessageEmbed()
        .setTitle('Melody')
        .setDescription('Share your Spotify music to a channel')
        .setColor('BLURPLE')
        .setTimestamp()
        .setFields([
            {
                name: 'State',
                value: config.state ? 'Enabled' : 'Disabled'
            },
            {
                name: 'Channel',
                value: config.channel ? `<#${config.channel}>` : 'None'
            },
            {
                name: 'Members',
                value: members.length ? members.join(' ') : 'None'
            },
            {
                name: 'Mode',
                value: config.mode === 'all' ? 'Everyone' : 'Members list'
            }
        ]);
}

function refreshedMainRow() {
    const config = getConfig();

    return new MessageActionRow().setComponents([
        new MessageButton().setStyle(config.state ? 'DANGER' : 'SUCCESS').setCustomId('Toggle').setLabel(config.state ? 'Disable' : 'Enable'),
        new MessageButton().setStyle('PRIMARY').setCustomId('Channel').setLabel('Channel'),
        new MessageButton().setStyle('PRIMARY').setCustomId('Member').setLabel('Member'),
        new MessageButton().setStyle('PRIMARY').setCustomId('Mode').setLabel('Mode')
    ]);
}

function refreshPresence() {
    const config = getConfig();

    switch (config.mode) {
        case 'list':
            return melody.user?.setActivity({ name: `${config.members.length} member${config.members.length > 1 ? 's' : ''}`, type: 'WATCHING' });
        case 'all':
            return melody.user?.setActivity({ name: 'everyone', type: 'WATCHING' });
    }
}

void melody.login(process.env.TOKEN);