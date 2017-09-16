const SerialPort = require('serialport');
const GPS = require('gps');
const net = require('net');
const port1 = '/dev/ttyACM0';
const port2 = '/dev/ttyACM1';
const gps = new GPS;

let latitude = 0;
let longitude = 0;
let seTmpData = '';
let sensor = '';

const serialArduino = new SerialPort(port1, {
    buaudrate: 9600,
    parser: SerialPort.parsers.readline('\r\n')
});

const serialGPS = new SerialPort(port2, {
    baudrate: 4800,
    parser: SerialPort.parsers.readline('\r\n')
});

serialGPS.on('data', function (data) {
    gps.update(data);
});

gps.on('data', function (data) {

    if (gps.state.lat !== undefined && gps.state.lon !== undefined) {
        latitude = gps.state.lat.toString();
        latitude = latitude.substring(0, 7);

        longitude = gps.state.lon.toString();
        longitude = longitude.substring(0, 9);
    }
});

serialArduino.on('data', function (data) {

    const mbRex = new Buffer(data);
    const string = mbRex.toString('ascii').trim();
    if (string.indexOf('{') > -1 || seTmpData.length > 0) {
        seTmpData = seTmpData + string;
        const indexFirst = seTmpData.indexOf('{');
        const indexLast = seTmpData.indexOf('}');
        if (indexFirst !== -1 && indexLast !== -1) {
            let seSensingData = seTmpData.substr(indexFirst, indexLast + 1);
            seTmpData = '';

            let re = /\0/g;
            let str = seSensingData.replace(re, "");
            let msg = JSON.parse(str);
			sensor = {code: 'booth', trash: msg.trash, smoke: msg.smoke, lat: latitude, lon: longitude};
            JSON.stringify(sensor);
        }
    }
});

function getConnection(connName) {
    let client = net.connect({port: 5001, host: 'jusk2.asuscomm.com'}, function () {
        console.log(connName + ' Connected: ');
        console.log('   local = %s:%s', this.localAddress, this.localPort);
        console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
        this.setEncoding('utf-8');
		register(client); 

        this.on('data', function (data) {
            console.log(connName + ' From Server: ' + data);
        });
        this.on('end', function () {
            console.log(connName + ' Client disconnected');
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
    });
    return client;
}

function register(socket) {
	let serviceRegister = {code: 'register', service: 'booth'}; 
	writeData(socket, serviceRegister); 
}

function writeData(socket, data) {
    socket.write(JSON.stringify(data));
}
const node1 = getConnection('node1');

setInterval(function () {
    console.log(sensor);
    writeData(node1, sensor);
}, 2000);

