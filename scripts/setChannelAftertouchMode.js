var ableton = require('../');

var push2 = new ableton.Push2();

push2.setAftertouchMode('channel').then(()=>{
	console.log("Aftertouch mode successfully set to 'channel'.");
	process.exit(0);
}).catch((err)=>{
	console.log("Error setting aftertouch mode.",err);
	process.exit(1);
});
