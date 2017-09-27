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
$ git clone https://github.com/samhiatt/node-ableton-push2
$ cd node-ableton-push2
$ npm install
```

## Usage

Make sure node can see your Push 2 with:
```
$ node examples/show_ports.js

Input ports:
	Ableton Push 2 Live Port
	Ableton Push 2 User Port
Output ports:
	Ableton Push 2 Live Port
	Ableton Push 2 User Port
```

Show MIDI messages from Push 2.
```
$ node examples/monitor_push.js

Ableton Push 2 User Port { channel: 0, note: 57, velocity: 80, _type: 'noteon' }
 pad 6,6 pressed, velocity: 80
Ableton Push 2 User Port { channel: 0, note: 58, velocity: 52, _type: 'noteon' }
 pad 7,6 pressed, velocity: 52
Ableton Push 2 User Port { channel: 0, note: 57, velocity: 0, _type: 'noteoff' }
 pad 6,6 released
Ableton Push 2 User Port { channel: 0, note: 58, velocity: 0, _type: 'noteoff' }
 pad 7,6 released
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
