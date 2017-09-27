# NodeJs MIDI control library for Ableton Push 2

Parses MIDI messages from Ableton Push 2.  
Includes MIDI mapping of buttons for Push 2.


Uses [easymidi](https://github.com/dinchak/node-easymidi) to parse and send MIDI messages to Push2.

##### Intentions for future development:
- Add documentation for using Push2 and MidiMonitor classes
- Add event listener wrappers to Push2 class
- Add sysex commands for further control of lights (setting palette, etc).
- Add support for Push 1. Maybe?

## Installation

```
$ npm install node-ableton-push2
```

## Usage

```javascript
var ableton = require('node-ableton-push2');

var push2 = new ableton.Push2(port='both'); // Yay! A New Ableton Push 2!!
push2.monitor(); 	// Monitor and parse MIDI messages, printing them to console.log
push2.stopMonitor(); 		// Removes event listeners

push2.setColor([2,3],30); 		// Set track 2, scene 3 to color 30
push2.setColor("play",127); 	// Set play key to color 127 (red)
push2.setColor("record",17); 	// Set record key to color 17 (blueish)
push2.setColor("1/16t",70); 	// Set 1/16t button to color 70
```

#### Handy example scripts
First probe MIDI ports to make sure node can see your Push 2 with:
```
$ cd node-ableton-push2
$ node examples/show_ports.js

Input ports:
	Ableton Push 2 Live Port
	Ableton Push 2 User Port
Output ports:
	Ableton Push 2 Live Port
	Ableton Push 2 User Port
```

Monitor messages from Push 2.
```
$ node examples/monitor_push.js

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



### Message Reference
The following table from [easymidi docs](https://github.com/dinchak/node-easymidi/blob/master/README.md) describes the MIDI message types that are supported and the parameters of each:

| Type               | Parameter          | Parameter        | Parameter      |
|--------------------|--------------------|------------------|----------------|
| noteon             | note [0-127]       | velocity [0-127] | channel [0-15] |
| noteoff            | note [0-127]       | velocity [0-127] | channel [0-15] |
| poly aftertouch    | note [0-127]       | velocity [0-127] | channel [0-15] |
| cc                 | controller [0-127] | value [0-127]    | channel [0-15] |
| program            | number [0-127]     |                  | channel [0-15] |
| channel aftertouch | pressure [0-127]   |                  | channel [0-15] |
| pitch              | value [0-16384]    |                  | channel [0-15] |
| position           | value [0-16384]    |                  |                |
| mtc                | type [0-7]         | value [0-15]     |                |
| select             | song [0-127]       |                  |                |
| clock              |                    |                  |                |
| start              |                    |                  |                |
| continue           |                    |                  |                |
| stop               |                    |                  |                |
| reset              |                    |                  |                |
