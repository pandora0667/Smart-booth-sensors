'use strict';
const net = require('net');
let server = null;

exports.getConnection = () => {
    server = net.connect({port: 5001, host: 'jusk2.asuscomm.com'}, function () {
        console.log(' Connected ');
        console.log('   local = %s:%s', this.localAddress, this.localPort);
        console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
        this.setEncoding('utf-8');
        register();

        this.on('data', function (data) {
            console.log(' From Server: ' + data);
        });
        this.on('end', function () {
            console.log(' Client disconnected');
        });
        this.on('error', function (err) {
            console.log('Socket Error: ', JSON.stringify(err));
        });
        this.on('timeout', function () {
            console.log('Socket Timed Out');
        });
        this.on('close', function () {
            console.log('Socket Closed');
        });
    })
};

exports.writeData = (data) => {
    if (server !== undefined || server !== null)
        server.write(data);
};

function register() {
    let serviceRegister = {code: 'register', service: 'booth'};
    server.write(JSON.stringify(serviceRegister));
}
