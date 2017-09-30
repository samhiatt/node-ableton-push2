var ableton = require('../');

var push2 = new ableton.Push2();


push2.getGlobalLEDBrightness().then((leds)=>{
  console.log("Global LED brightness:",leds);
  process.exit(0);
}).catch((err)=>{
  console.error(err);
  process.exit(1);
});
