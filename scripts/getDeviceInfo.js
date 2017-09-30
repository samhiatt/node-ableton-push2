var ableton = require('../');

var push2 = new ableton.Push2(port='user');

push2.getDeviceInfo().then((info)=>{
  console.log(info);
  process.exit(0);
});
