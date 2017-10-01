var ableton = require('../');

var push2 = new ableton.Push2();
push2.getAftertouchMode().then((mode)=>{
  console.log("Aftertouch mode:",mode);
  process.exit(0);
}).catch((err)=>{
  console.error(err);
  process.exit(1);
});
