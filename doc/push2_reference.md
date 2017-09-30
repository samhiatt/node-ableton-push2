# Push 2 command reference
(Ableton Push 2 MIDI and Display Reference Documentation)[https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#213-device-inquiry]

#### Touch Strip Configuration
(Touch strip configuration reference documentation)[https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#2101-touch-strip-configuration] is available here.

#### Touch strip configuration options
 | TouchStripConfiguration property | Behavior if false | Behavior if true | Remarks |
 | ------------------------|----------------------------|------------------|---------|
 | `LEDsControlledByHost`  | **controlled by push**     | controlled by host | LED values received from the host are ignored if this is set to `false` (default behavior) |
 | `hostSendsSysex`        | **host sends values**      | host sends sysex | Host sends position values or sysex commands for full control of LEDs. |
 | `valuesSentAsModWheel`  | **values sent as mod wheel** | values sent as pitch bend | Controls whether lights are controlled by sending pitch bend or mod wheel messages. Ignored if `hostSendsSysex == true`. |
 | `LEDsShowPoint`         | LEDs show a bar            | **LEDs show a point** | |
 | `barStartsAtCenter`     | **bar starts at bottom**   | bar starts at center | |
 | `doAutoReturn`          | auto-return disabled       | **auro-return enabled** | |
 | `autoReturnToCenter`    | auto-returns to bottom     | **auto-returns to center** |  Ignored if `doAutoReturn==false`. |
 (defaults indicated with **bold**)

`LEDsControlledByHost`  
If `LEDsControlledByHost==false`, the touch strip hardware sends the value both to the LEDs hardware as well as to the host, simultaneously. Values received from the host are ignored.  
If `LEDsControlledByHost==true`, the touch strip hardware sends position values to the host only. It is the host's responsibility to update to the LEDs while in this mode.  

`hostSendsSysex` and `valuesSentAsModWheel`
If the LEDs are controlled by the host (`LEDsControlledByHost==true`), then the host may send commands as
position values or as sysex commands for full control of pitch bend LEDs.  
If `hostSendsSysex==false`, the host may send pitch bend (if `valuesSentAsModWheel==false`) or mod wheel (if `valuesSentAsModWheel==true`) to indicate position with the LEDs. The sysex command "setTouchStripLEDs" is ignored while in this mode.  
If `hostSendsSysex==true`, the host may call "setTouchStripLEDs" to set the LEDs. Pitch bend or mod wheel are ignored in this mode.  
LED 0 is the bottom LED, LED30 is the top LED. The LEDn values are brightness ranging from 0 to 7.
