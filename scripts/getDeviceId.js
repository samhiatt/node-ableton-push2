let ableton = require('../');

let push2 = new ableton.Push2(port='user');

push2.getDeviceId().then((info)=>{
  console.log(info);
  process.exit(0);
});
