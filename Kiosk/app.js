const SerialPort = require('serialport');
const file = '/dev/ttyACM0';
const Readline = SerialPort.parsers.Readline;

const port = new SerialPort(file, {
    baudrate: 9600
});

const parser = port.pipe(new Readline({delimeter: '\r\n'}));

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
