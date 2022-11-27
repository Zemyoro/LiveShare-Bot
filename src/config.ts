import { readFileSync, writeFileSync } from 'fs';

export function getConfig() {
    return JSON.parse(readFileSync('./config.json', 'utf-8')) as Config;
}

export function updateConfig(config: Config) {
    writeFileSync('./config.json', JSON.stringify(config, null, 4));
    return config;
}

interface Config {
    state: boolean; // On/Off
    mode: 'all' | 'list'; // Watch everyone or members list
    channel: string; // Channel to send Melody embeds to
    members: string[]; // Members list
}