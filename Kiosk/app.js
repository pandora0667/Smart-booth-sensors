'use strict';

const SerialPort = require('serialport');
const port = '/dev/ttyACM0';
const tcp = require('./tcp');
tcp.getConnection();

const serialArduino = new SerialPort(port, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\r\n')
});

let seTmpData = '';

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
			try { 

				let msg = JSON.parse(str);
				if (msg.smoking1 !== undefined && msg.smoking2 !== undefined) {
					let smokeData = {code: 'kiosk', smoke: msg.smoking1 + msg.smoking2};
					tcp.writeData(smokeData);
				}
			} catch(exception) {
				console.log('정상적으로 paring 돼지 않았습니다.'); 
			}
        }
    }
});
