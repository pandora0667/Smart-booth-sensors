const SerialPort = require('serialport');
const net = require('net');
const port = '/dev/ttyACM0';
const Readline = SerialPort.parsers.Readline;

const portSpeed = new SerialPort(port, {
    baudrate: 9600
});

const parser = portSpeed.pipe(new Readline({delimeter: '\r\n'}));

let seTmpData = '';
let seSensingData = '';
let msg = '';
parser.on('data', function (data) {

    //TODO Arduino json format
    const mbRex = new Buffer(data);
    const string = mbRex.toString('ascii').trim();
    if (string.indexOf('{') > -1 || seTmpData.length > 0) {
        seTmpData = seTmpData + string;
        const indexFirst = seTmpData.indexOf('{');
        const indexLast = seTmpData.indexOf('}');
        if (indexFirst !== -1 && indexLast !== -1) {
            seSensingData = seTmpData.substr(indexFirst, indexLast + 1);
            seTmpData = "";
            msg = JSON.parse(seSensingData);
        }
    }
});



function getConnection(connName) {
    let client = net.connect({port: 5001, host: '203.230.100.177'}, function () {
        console.log(connName + ' Connected: ');
        console.log('   local = %s:%s', this.localAddress, this.localPort);
        console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
        this.setEncoding('utf8');

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

function writeData(socket, data) {
    socket.write(JSON.stringify(data));
}
const node1 = getConnection('node1');

setInterval(function () {
    console.log(msg);

	if (msg.sensing === 'true') { 	
	let sendData = {code: 'kiosk', smoking: msg.smoking1 + msg.smoking2}; 
    writeData(node1, sendData);	
	}
}, 2000);
