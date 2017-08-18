const file = '/dev/ttyACM0';
const SerialPort = require('serialport');
const GPS = require('gps');
const gps = new GPS;
const net = require('net'); 

const port = new SerialPort(file, {
		  baudrate: 4800,
		  parser: SerialPort.parsers.readline('\r\n')
});

function getConnection(connName){
	let client = net.connect({port: 5001, host:'192.168.0.32'}, function() {
			console.log(connName + ' Connected: ');
			console.log('   local = %s:%s', this.localAddress, this.localPort);
			console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
			this.setEncoding('utf8');

			this.on('data', function(data) {
					console.log(connName + ' From Server: ' + data);
					});
			this.on('end', function() {
					console.log(connName + ' Client disconnected');
					});
			this.on('error', function(err) {
					console.log('Socket Error: ', JSON.stringify(err));
					});
			this.on('timeout', function() {
					console.log('Socket Timed Out');
					});
			this.on('close', function() {
					console.log('Socket Closed');
					});
	});
	return client;
}

function writeData(socket, data){
	let success = !socket.write(data);
}

let latitude = 0;
let longitude = 0;
let smoke = 70;  
let trash = true; 

gps.on('data', function(data) {
			
	if (gps.state.lat !== undefined && gps.state.lon !== undefined) {
				latitude = gps.state.lat.toString(); 
	            latitude = latitude.substring(0,7);

				longitude = gps.state.lon.toString(); 
				longitude = longitude.substring(0,9);
	}
});

setInterval(function() { 
    let boothSensor = {code:'00', smoke: smoke, trash: trash, lat: latitude, lon: longitude};
	console.log(boothSensor);
	writeData(node1, JSON.stringify(boothSensor));
},3000); 

port.on('data', function(data) {
				gps.update(data);
});

const node1 = getConnection("node1");
