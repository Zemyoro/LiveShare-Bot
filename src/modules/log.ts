import fs from 'fs';

const firstLine = 'Problems will be logged here';
const clearedOn = () => {
    const date = new Date();
    return `Cleared on ${date.getFullYear()}/${date.getMonth()}/${date.getDay()} (${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()})`;
}

export default function(data: string) {
    console.log(data);
    if (!fs.existsSync('./log.txt')) fs.writeFileSync('./log.txt', firstLine);
    let logFile: string | string[] = fs.readFileSync('./log.txt').toString();
    logFile = logFile.split('\n');

    if (logFile.length > 200) logFile = [firstLine, clearedOn()];

    logFile.push(data);
    logFile = logFile.join('\n');
    fs.writeFileSync('./log.txt', logFile);
}