var ableton = require('../');

var push2 = new ableton.Push2();

push2.getDisplayBrightness().then((val)=>{
	console.log("Display brightness is:",val);
	process.exit(0);
}).catch((err)=>{
	console.log("Error getting display brightness.",err);
	process.exit(1);
});
