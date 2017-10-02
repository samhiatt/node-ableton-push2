## Rough development roadmap

- Map the buttons using the names used in th [MIDI mapping reference](https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#23-midi-mapping)





### Command List
|Command ID|Implemented|Test Implemented|Sends Reply|Command Name|[Chapter](https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc)|
|----------|------|-----------|-----------|------------|-------|
|`0x03` |   |   | |Set LED Color Palette Entry  |RGB LED Color Processing
|`0x04` |   | x |yes|Get LED Color Palette Entry | RGB LED Color Processing
|`0x05` | x | x | |Reapply Color Palette | RGB LED Color Processing
|`0x06` | x | x | |Set LED Brightness   |Global LED Brightness
|`0x07` | x | x |yes|Get LED Brightness | Global LED Brightness
|`0x08` | x | x | |Set Display Brightness |Display Backlight
|`0x09` | x | x | |Get Display Brightness |Display Backlight
|`0x0A` | x | x |yes|Set MIDI Mode |MIDI Mode
|`0x0B` |   |   | |Set LED PWM Frequency Correction |PWM Frequency
|`0x13` |   |   |yes|Sample Pedal Data |Pedal Sampling
|`0x14` |   |   | |Set LED White Balance  |White Balance
|`0x15` |   |   |yes|Get LED White Balance|White Balance
|`0x17` | x | x | |Set Touch Strip Configuration  |Touch Strip
|`0x18` | x | x |yes|Get Touch Strip Configuration|Touch Strip
|`0x19` | x | x | |Set Touch Strip LEDs|Touch Strip
|`0x1A` | x | x |yes|Request Statistics |Statistics
|`0x1B` |   |   | |Set Pad Parameters |Pad Parameters
|`0x1D` |   |   |yes|Read 400g Pad Values From Flash |Individual Pad Calibration
|`0x1E` | x | x | |Set Aftertouch Mode |Aftertouch
|`0x1F` | x | x |yes|Get Aftertouch Mode|Aftertouch
|`0x20` |   |  | |Set Pad Velocity Curve Entry |Velocity Curve
|`0x21` |   |  |yes|Get Pad Velocity Curve Entry|Velocity Curve
|`0x22` |   |  | |Set Temporary 400g Pad Values |Individual Pad Calibration
|`0x23` |   |  |yes|Flash LED White Balance|White Balance
|`0x28` |   |  | |Select Pad Settings |Pad Settings
|`0x29` |   |  |yes|Get Selected Pad Settings|Pad Settings
|`0x30` |   |  | |Configure Pedal |Pedal Configuration
|`0x31` |   |  | |Set Pedal Curve Limits|Pedal Configuration
|`0x32` |   |  | |Set Pedal Curve Entries|Pedal Configuration
