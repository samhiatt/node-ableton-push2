var ableton = require('../');

var push2 = new ableton.Push2(port='user');

push2.getTouchStripConfiguration().then((resp)=>{
  console.log(resp);
  process.exit(0);
}).catch((err)=>{
  console.error(err);
  process.exit(1);
});
