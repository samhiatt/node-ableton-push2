let ableton = require('../');

let push = new ableton.Push2(port='user',virtual=false);

push.setColor([2,3],30); // Set track 2, scene 3 to color 30
push.setColor("play",127); // Set play key to color 127 (red)
push.setColor("record",17); // Set record key to color 17 (blueish)
push.setColor("1/16t",70); // Set 1/16t button to color 70

process.exit(0);
