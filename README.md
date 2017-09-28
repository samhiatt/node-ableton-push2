# NodeJs MIDI control library for Ableton Push 2

Parses MIDI messages from Ableton Push 2.  
Includes MIDI mapping of buttons for Push 2.


Uses [easymidi](https://github.com/dinchak/node-easymidi) to parse and send MIDI messages to Push2.

See [midi.md](/doc/midi.md) for documentation on access to low-level MIDI messages.

##### Intentions for future development:
- Add sysex commands for further control of lights (setting palette, etc).
- Add support for Push 1. Maybe?

## Installation

```
$ npm install node-ableton-push2
```

## Usage

Instantiate a new Push2 object.
```javascript
var ableton = require('ableton-push2');

// port can be 'user' (default) or 'live'
var push2 = new ableton.Push2(port='user'); // Yay! A New Ableton Push 2!!
```

Monitor control messages from Push 2.
```javascript
push2.monitor(); 	// Monitor and parse MIDI messages, printing them to console.log
push2.stopMonitor(); 		// Stops printing Push2 midi messages to console.
```

Set LED colors:
```javascript
// First argument can be either a key name from push2keymap
// or it can also be an array containing [track,scene] with values [[1-8],[1-8]]
// paletteIdx: color palette index [1-127]
push2.setColor([2,3],30); 		// Set track 2, scene 3 to color 30
push2.setColor("play",127); 	// Set play key to color 127 (red)
push2.setColor("record",17); 	// Set record key to color 17 (blueish)
push2.setColor("1/16t",70); 	// Set 1/16t button to color 70
```

```javascript
// Listen to all MIDI messages
push2.midi.on('message', function(msg){ console.log(msg); });

// Or listen to specific midi messages (easymidi message type names)
push2.midi.on('noteon', function(msg){
	console.log(`"noteon": note: ${msg.note}, velocity:${msg.velocity}, channel:${msg.channel}`);
});
```
See [midi.md](/doc/midi.md) for more on low-level access to MIDI messages.

#### Handy example scripts
A few handy scripts are included in `scripts/`.

First probe MIDI ports to make sure node can see your Push 2 with:
```
$ cd node-ableton-push2
$ node scripts/show_ports.js

Input ports:
	Ableton Push 2 Live Port
	Ableton Push 2 User Port
Output ports:
	Ableton Push 2 Live Port
	Ableton Push 2 User Port
```

Monitor messages from Push 2.
```
$ node scripts/monitor_push.js

Ableton Push 2 User Port { channel: 0, note: 36, velocity: 56, _type: 'noteon' }
 pad 1,8 pressed, velocity: 56
Ableton Push 2 User Port { channel: 0, note: 36, velocity: 0, _type: 'noteoff' }
 pad 1,8 released
Ableton Push 2 User Port { channel: 0, controller: 85, value: 127, _type: 'cc' }
 play: 127
Ableton Push 2 User Port { channel: 0, controller: 85, value: 0, _type: 'cc' }
 play: 0
...
^C
```  
(Exit with ctrl+C)


## References

[Summary of MIDI Messages](https://www.midi.org/specifications/item/table-1-summary-of-midi-message)  
[Ableton Push 2 MIDI And Display Interface Manual](https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc)  
