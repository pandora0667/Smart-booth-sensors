const SerialPort = require('serialport');
const net = require('net');
const port = '/dev/ttyACM0';

const serialArduino = new SerialPort(port, {
		buaudrate: 9600, 
		parser: SerialPort.parsers.readline('\r\n')
});

let seTmpData = '';
let seSensingData = '';
let smokeData = ''; 

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
				
				if (msg.smoking1 != undefined && msg.smoking2 != undefined) {
					smokeData = {code: 'kiosk', smoke: msg.smoking1 + msg.smoking2};

					console.log(smokeData); 
					JSON.stringify(smokeData); 
				}
        }
    }
});

function getConnection(connName) {
    let client = net.connect({port: 5001, host: 'jusk2.asuscomm.com'}, function () {
        console.log(connName + ' Connected: ');
        console.log('   local = %s:%s', this.localAddress, this.localPort);
        console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
        this.setEncoding('utf8');
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
	 let serviceRegister = {code: 'register', service: 'kiosk'}; 
	 sendData(socket, serviceRegister); 
}


function sendData(socket, data) {
    socket.write(JSON.stringify(data));
}

const node1 = getConnection('node1');

setInterval(function () {
	sendData(node1, smokeData);	
}, 1000);
