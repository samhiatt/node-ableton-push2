let ableton = require('../');

let push2 = new ableton.Push2();

push2.setAftertouchMode('poly').then(()=>{
	console.log("Aftertouch mode successfully set to 'poly'.");
	process.exit(0);
}).catch((err)=>{
	console.log("Error setting aftertouch mode.",err);
	process.exit(1);
});
