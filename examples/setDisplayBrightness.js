var ableton = require('../');

var push2 = new ableton.Push2();

push2.setDisplayBrightness(200).then(()=>{
	console.log("Display brightness successfully set.");
	process.exit(0);
}).catch((err)=>{
	console.log("Error setting display brightness.",err);
	process.exit(1);
});
