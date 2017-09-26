var midi = require('midi');
var input = new midi.input();

var portCount = input.getPortCount();
console.log(`There are ${portCount} MIDI ports.`);

for (var i=0; i<portCount; i++){
	console.log(`port ${i}: ${input.getPortName(i)}`);
}

process.exit(0);

