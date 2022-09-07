import fs from 'fs';

const firstLine = 'Problems will be logged here';

export default function(data: string) {
    console.log(data);
    if (!fs.existsSync('./log.txt')) fs.writeFileSync('./log.txt', firstLine);
    let logFile: any = fs.readFileSync('./log.txt').toString();
    logFile = logFile.split('\n');
    logFile.push(data);
    fs.writeFileSync('./log.txt', logFile);
}