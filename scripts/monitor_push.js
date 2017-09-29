var ableton = require('../');

var push2user = new ableton.Push2('user');
push2user.monitor();

var push2live = new ableton.Push2('live');
push2live.monitor();
