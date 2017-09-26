# NodeJs MIDI control library for Ableton Push 2

Parses MIDI messages from Ableton Push 2.  
Includes MIDI mapping of buttons for Push 2.


Uses [midi-stream](https://github.com/livejs/midi-stream) to parse and send MIDI messages. I drew inspiration from [easymidi](https://github.com/dinchak/node-easymidi), however wasn't able to get it working on my (OS X) system, so I rely instead on [midi-stream](https://github.com/livejs/midi-stream), which depends on [web-midi](https://github.com/mmckegg/web-midi).

##### Intentions for future development:
- Add functions to control lights. (Send 'note on' messages to pads.)
- Align message type names with those in [easymidi](https://github.com/dinchak/node-easymidi).
- Add support for more sysex commands.
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
$ node show_ports.js
There are 2 MIDI ports.
port 0: Ableton Push 2 Live Port
port 1: Ableton Push 2 User Port
```

Show MIDI messages from Push 2.
```$ node show_stream.js
note on "pad 1,8" value: 27
note off "pad 1,8" value: 0
control change "play" value: 127
control change "play" value: 0
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
