const SerialPort = require('serialport');
const GPS = require('gps');
const net = reauire('net');
const port1 = '/dev/ttyACM0';
const port2 = '/dev/ttyACM1';
const gps = new GPS;

let latitude = 0;
let longitude = 0;
let seTmpData = '';
let boothSensor = '';

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

gps.on(, function () {

    if (gps.state.lat !== undefined && gps.state.lon !== undefined) {
        latitude = gps.state.lat.toString();
        latitude = latitude.substring(0, 7);

        longitude = gps.state.lon.toString();
        longitude = longitude.substring(0, 9);
    }
});

serialArduino.on('data', function (data) {

    //TODO Arduino JSON format
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
            boothSensor = {trash: msg.trash, smoke: msg.smoke, lat: latitude, lon: longitude};
            JSON.stringify(boothSensor);
        }
    }
});

setInterval(function () {
    console.log(boothSensor);
    console.log(boothSensor.lat);
}, 1000);

