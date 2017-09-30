var ableton = require('../');

var push2 = new ableton.Push2(port='user');

push2.setTouchStripConfiguration({LEDsControlledByPushOrHost:1}).then((conf)=>{
  console.log(conf);
  process.exit(1);
}).catch(console.error);
