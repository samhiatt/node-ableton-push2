# MIDI Message Reference

`Push2.midi` provides an `EventEmitter` interface to the underlying MIDI messages using [easymidi](https://github.com/dinchak/node-easymidi).

Listen to all MIDI messages by adding a listener for `message` events.

```javascript
var ableton = require('ableton-push2');
var push2 = new ableton.Push2('user');

push2.midi.on('message',console.log);
```
```
{ channel: 0, note: 37, velocity: 31, _type: 'noteon' }
{ channel: 0, note: 37, pressure: 31, _type: 'poly aftertouch' }
{ channel: 0, note: 37, pressure: 24, _type: 'poly aftertouch' }
{ channel: 0, note: 37, velocity: 0, _type: 'noteoff' }
{ channel: 0, controller: 85, value: 127, _type: 'cc' }
{ channel: 0, controller: 85, value: 0, _type: 'cc' }
...
```

Or you can listen for specific midi message types:
```javascript
push2.midi.on('noteon',console.log);
```

```
{ channel: 0, note: 53, velocity: 34, _type: 'noteon' }
{ channel: 0, note: 54, velocity: 42, _type: 'noteon' }
{ channel: 0, note: 47, velocity: 38, _type: 'noteon' }
{ channel: 0, note: 61, velocity: 27, _type: 'noteon' }
...
```

```javascript
push2.midi.on('noteoff',console.log);
```

```
{ channel: 0, note: 54, velocity: 0, _type: 'noteoff' }
{ channel: 0, note: 46, velocity: 0, _type: 'noteoff' }
...
```

```javascript
push2.midi.on('poly aftertouch',console.log);
```

```
{ channel: 0, note: 62, velocity: 91, _type: 'poly aftertouch' }
{ channel: 0, note: 69, velocity: 32, _type: 'poly aftertouch' }
{ channel: 0, note: 62, velocity: 38, _type: 'poly aftertouch' }
{ channel: 0, note: 61, velocity: 25, _type: 'poly aftertouch' }
...
```

```javascript
push2.midi.on('cc',console.log);
```

```
{ channel: 0, controller: 59, value: 127, _type: 'cc' }
{ channel: 0, controller: 59, value: 0, _type: 'cc' }
...
```

```javascript
push2.midi.on('pitch',console.log);
```

```
{ channel: 0, value: 6592, _type: 'pitch' }
{ channel: 0, value: 6656, _type: 'pitch' }
...
```

### MIDI Message Event Types
The following table describes the MIDI message event types that are supported and the parameters of each:

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
