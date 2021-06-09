let ableton = require('.');

let push2 = new ableton.Push2('live', false);

push2.getStatistics().then((val)=>{
   console.log(val);
});

push2.monitor();
