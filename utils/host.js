if (!process.argv[2] || process.argv[2] !== '--pm2') {
    console.log('Run this script with a --pm2 parameter to confirm you installed pm2 globally.');
    console.log('NPM: npm install -g pm2');
    console.log('\nWhen finished: npm run host --pm2');
    process.exit(0);
}

const { exec } = require('child_process');
const { version } = require('../package.json');

exec('pm2 list', (err, stdout, stderr) => {
    if (err || stderr) {
        console.log('You may have not installed pm2 globally.');
        console.log('NPM: npm install -g pm2');
        console.log('\nThen run this script again.');

        // Uncomment to check error.
        // console.log(err);
        // console.log(stderr);

        process.exit(0);
    }

    let run = true;

    if (stdout.includes('Melody')) {
        run = false;
        const index = stdout.indexOf('Melody');
        const line = stdout.substring(index, stdout.indexOf('\n', index));

        if (line.includes(version)) {
            exec('pm2 restart Melody', (err, stdout, stderr) => {
                if (err || stderr) {
                    console.log('There was an error restarting Melody.');
                    console.log(err || 'No error message.');
                    console.log(stderr || 'No stderr message.');
                }

                console.log('Melody has been restarted.');
            });
        } else {
            exec('pm2 delete Melody', (err, stdout, stderr) => {
                if (err || stderr) {
                    console.log('There was an error removing Melody from pm2.');
                    console.log(err || 'No error message.');
                    console.log(stderr || 'No stderr message.');
                }
                console.log('Unusual Melody process has been removed.');
                host();
            });
        }
    }

    if (run) host();
});


function host() {
    exec('pm2 start . --name Melody', (err, stdout, stderr) => {
        if (err || stderr) {
            console.log('An error occurred while starting Melody.');
            console.log(err || 'No error message.');
            console.log(stderr || 'No stderr message.');
        }

        console.log('Melody is now hosting.');
    });
}