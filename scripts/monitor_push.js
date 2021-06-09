let ableton = require('../');

let push2user = new ableton.Push2('user');
push2user.monitor();

let push2live = new ableton.Push2('live');
push2live.monitor();
