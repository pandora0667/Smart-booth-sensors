const SerialPort = require('serialport');
const file = '/dev/ttyACM0';
const file2 = '/dev/ttyACM1'; 
const GPS = require('gps');
const gps = new GPS;

const port = new SerialPort(file, {
	buaudrate:9600
});

const port2 = new SerialPort(file2, {
	baudrate: 4800, 
	parser: SerialPort.parsers.readline('\r\n')
}); 

let latitude = 0;
let longitude = 0;
let seSensigData = '';
let seTmpData = '';
let boothSensor = '';

port2.on('data', function(data) {
		gps.update(data); 
}); 

gps.on('data', function(data) {			
	if (gps.state.lat !== undefined && gps.state.lon !== undefined) {
				latitude = gps.state.lat.toString(); 
	            latitude = latitude.substring(0,7);

				longitude = gps.state.lon.toString(); 
				longitude = longitude.substring(0,9);
		}

});

port.on('data', function(data) { 
	let msg = new Buffer(data, 'utf-8');  
	console.log(msg.toString()); 
});

