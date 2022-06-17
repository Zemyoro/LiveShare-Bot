const { exec } = require('child_process');
const { version } = require('../package.json');

exec('pm2 list', (err, stdout, stderr) => {
    if (err || stderr) {
        console.log(err || 'No error message.');
        console.log(stderr || 'No stderr message.');

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
                    process.exit(0);
                }

                console.log('Melody has been restarted.');
            });
        } else {
            exec('pm2 delete Melody', (err, stdout, stderr) => {
                if (err || stderr) {
                    console.log('There was an error removing Melody from pm2.');
                    console.log(err || 'No error message.');
                    console.log(stderr || 'No stderr message.');
                    process.exit(0);
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
            process.exit(0);
        }

        console.log('Melody is now hosting.');
    });
}