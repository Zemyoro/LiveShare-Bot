const cliSelect = require('cli-select');
const shellExec = require('shell-exec').default;

(async () => {
    console.log('Is PM2 installed globally?');
    const output = await cliSelect({
        values: ['Yes', 'No', 'Not sure'],
        valueRenderer: (value) => {
            return value;
        }
    }).then(async answer => {
        if (answer.id) {
            console.log('Installing PM2...');
            return shellExec('npm i -g pm2').then(output => {
                if (output.code > 0) return false;
                else {
                    console.log('PM2 installed successfully.');
                    return true;
                }
            });
        } else return true;
    });

    if (!output) return console.log('PM2 is not installed globally.');

    console.log('\nSelect operating system:');

    cliSelect({
        values: ['Windows', 'macOS', 'Linux'],
        valueRenderer: (value) => {
            return value;
        }
    }).then(async value => {
        switch (value.value) {
            case 'Windows':
                return console.log('You\'re all set!');
            case 'macOS':
                return console.log('You should be set set! If any issues occur, install Homebrew and run: brew install pkg-config cairo pango libpng jpeg giflib librsvg');
            case 'Linux':
                return cliSelect({
                    values: ['Ubuntu', 'Fedora', 'Solaris', 'OpenBSD'],
                    valueRenderer: (value) => {
                        return value;
                    }
                }).then(value => {
                    switch (value.value) {
                        case 'Ubuntu':
                            return shellExec('sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev').then(console.log).catch(console.error);
                        case 'Fedora':
                            return shellExec('sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel').then(console.log).catch(console.error);
                        case 'Solaris':
                            return shellExec('pkgin install cairo pango pkg-config xproto renderproto kbproto xextproto').then(console.log).catch(console.error);
                        case 'OpenBSD':
                            return shellExec('doas pkg_add cairo pango png jpeg giflib').then(console.log).catch(console.error);
                    }
                });
        }
    });
})();