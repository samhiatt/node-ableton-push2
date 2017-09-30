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
$ npm install ableton-push2
```

## Usage

### Usage examples
##### Get a new Push2. Oh yeah.
```javascript
var ableton = require('ableton-push2');

// port can be 'user' (default) or 'live'
var push2 = new ableton.Push2(port='user'); // Boom! A New Ableton Push 2!!
```

##### Monitor control messages from Push 2.
```javascript
push2.monitor(); 	// Monitor and parse MIDI messages, printing them to console.log
push2.stopMonitor(); 		// Stops printing Push2 midi messages to console.
```

##### Set pad or button LED colors:
```javascript
// First argument can be either a key name from push2keymap
// or it can also be an array containing [track,scene] with values [[1-8],[1-8]]
// paletteIdx: color palette index [1-127]
push2.setColor([2,3],30); 		// Set track 2, scene 3 to color 30
push2.setColor("play",127); 	// Set play key to color 127 (red)
push2.setColor("record",17); 	// Set record key to color 17 (blueish)
push2.setColor("1/16t",70); 	// Set 1/16t button to color 70
```
TODO: Update and document interface for addressing buttons.

### Touch strip configuration

##### Get touch strip configuration
```javascript
push2.getTouchStripConfiguration()
	.then((resp)=>{
	  console.log(resp);
	}).catch(console.error);
// Output:
// TouchStripConfiguration {
//   LEDsControlledByHost: 0,
//   hostSendsSysex: 0,
//   valuesSentAsModWheel: 0,
//   LEDsShowPoint: 1,
//   barStartsAtCenter: 1,
//   doAutoReturn: 1,
//   autoReturnToCenter: 1 }
```

##### Set touch strip configuration
Returns a Promise which resolves after verifying that the value was set correctly.  

Set all options at once:
```javascript
var newConfig = {
		'LEDsControlledByPushOrHost':1,
		'hostSendsSysex': 0,
		'valuesSentAsModWheel': 0,
		'LEDsShowPoint': 1,
		'barStartsAtCenter': 1,
		'doAutoReturn': 1,
		'autoReturnToCenter': 1,
};
push2.setTouchStripConfiguration(newConfig).then((conf)=>{
  console.log("Touch strip configuration successfully set to:",conf);
}).catch(console.error);
```
Or you can specify just a subset of properties to change. Others remain unchanged.
```javascript
push2.setTouchStripConfiguration({'LEDsControlledByPushOrHost':1}).then((conf)=>{
  console.log("Touch strip configuration successfully set to:",conf);
}).catch(console.error);
// Output:
// Touch strip configuration successfully set to: TouchStripConfiguration {
// LEDsControlledByHost: 1,
// hostSendsSysex: 0,
// valuesSentAsModWheel: 0,
// LEDsShowPoint: 1,
// barStartsAtCenter: 1,
// doAutoReturn: 1,
// autoReturnToCenter: 1 }
```
###### Reset touch strip confg to defaults
Calling `setTouchStripConfiguration` with no arguments will reset to defaults.
```javascript
push2.setTouchStripConfiguration(); // Resets to defaults
```
It is not necessary to handle the callback if you don't care to validate the result.


#### Touch strip configuration options
 | TouchStripConfiguration property | Behavior if false | Behavior if true | Remarks |
 | ------------------------|----------------------------|------------------|---------|
 | `LEDsControlledByHost`  | **controlled by push**     | controlled by host | LED values received from the host are ignored if this is set to `false` (default behavior) |
 | `hostSendsSysex`        | **host sends values**      | host sends sysex | Host sends position values or sysex commands for full control of LEDs. |
 | `valuesSentAsModWheel`  | **values sent as mod wheel** | values sent as pitch bend | Controls whether lights are controlled by sending pitch bend or mod wheel messages. Ignored if `hostSendsSysex == true`. |
 | `LEDsShowPoint`         | LEDs show a bar            | **LEDs show a point** | |
 | `barStartsAtCenter`     | **bar starts at bottom**   | bar starts at center | |
 | `doAutoReturn`          | auto-return disabled       | **auro-return enabled** | |
 | `autoReturnToCenter`    | auto-returns to bottom     | **auto-returns to center** | Ignored if `doAutoReturn==false`. |
 |                    |           |                               | (defaults indicated with **bold**)  |  

 See [Touch Strip Configuration Documentation](/doc/push2_reference.md#touch-strip-configuration) for details on how they work.


### Control display backlight
##### Get/set display backlight brightness
Display backlight brightness ranges from 0 to 255.   Note that when Push 2 is on
USB power the brightness is automatically reduced to 100.  

`Push2.getDisplayBrightness` returns a Promise.
```javascript
push2.getDisplayBrightness()
	.then((value)=>console.log("Display brightness: "+value))
	.catch((err)=>console.log("Error getting display brightness.",err));
```

`Push2.setDisplayBrightness` also returns a Promise which resolves after
verifying that the value was set correctly.
```javascript
push2.setDisplayBrightness(200)
	.then(()=>console.log("Display brightness successfully set."))
	.catch((err)=>console.log("Error setting display brightness.",err));
```

#### Monitor raw MIDI Messages
See [midi.md](/doc/midi.md) for more on low-level access to MIDI messages.
```javascript
// Listen to all MIDI messages
push2.midi.on('message', console.log);

// Or listen to specific midi messages (easymidi message type names)
push2.midi.on('noteon', function(msg){
	console.log(`"noteon": note: ${msg.note}, velocity:${msg.velocity}, channel:${msg.channel}`);
});
```

### Handy example scripts
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
