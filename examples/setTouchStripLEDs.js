var ableton = require('../');

var push2 = new ableton.Push2();

push2.setTouchStripLEDs([2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0]).then((res)=>{
  console.log("Successfully set touch strip LEDs.",res);
  process.exit(0);
}).catch((err)=>{
  console.error(err);
  process.exit(1);
});
