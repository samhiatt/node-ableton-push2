var ableton = require('../');

var push2 = new ableton.Push2(port='user');

push2.getTouchStripConfiguration().then((resp)=>{
  console.log(resp);
  process.exit(1);
}).catch(console.error);
