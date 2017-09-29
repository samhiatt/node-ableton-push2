# Push 2 command reference
(Ableton Push 2 MIDI and Display Reference Documentation)[https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#213-device-inquiry]

#### Touch Strip Configuration
```
Configuration Flags
  ---------------
bit |6|5|4|3|2|1|0|
  ---------------                       |   0         |   1
     | | | | | | |  --------------------+-------------+----------
     | | | | | | --- LEDs Controlled By | Push 2*     | Host
     | | | | | ----- Host Sends         | Values*     | Sysex
     | | | | ------- Values Sent As     | Pitch Bend* | Mod Wheel
     | | | --------- LEDs Show          | a Bar       | a Point*
     | | ----------- Bar Starts At      | Bottom*     | Center
     | ------------- Do Autoreturn      | No          | Yes*
     --------------- Autoreturn To      | Bottom      | Center*

*) The default settings are marked in bold.
```
(Touch strip configuration documentation)[https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#2101-touch-strip-configuration]

#### Device Inquiry

 [F0 7E 01 06 01 F7] = request identity

##### Table 8 Device Inquiry Reply
| Byte | Description  |  
| -------------- | -----------  |
| 0xF0 (240)     | SOX          |
| 0x7E (126)     | Universal Non-Realtime Sysex ID |
| 0x01           | Device ID |
| 0x06           | SubID1: General Information |
| 0x02           | SubID2: Identity Reply |
| 0x00 0x21 0x1D | Manufacturers Sysex ID code |
| 0x67 0x32      | device family code, 2x7 bits, LSB first (Product ID from USB header) |
| 0x02 0x00      | device family member code, 2x7 bits, LSB first (Push 2) |
|n               |major software revision (7 bits) |
|m               |minor software revision (7 bits) |
|k (LSB)         |lower 7 bits |software build |
|k (MSB)         |higher 7 bits |
|s (LSB)         |bits 0... 6  |serial number |
|s               |bits 7...13 |
|s               |bits 14...20 |
|s               |bits 21...27 |
|s (MSB)         |bits 28...31 |
|r               |board revision (7 bits) |
| 0xF7 (247)     |EOX |

Example reply:  [F0 7E 01 06 02 00 21 1D 67 32 02 00 01 00 2F 00 73 4D 1F 08 00 01 F7] =  
manufacturer 00 21 1D (Ableton),  
device family 0x1967 (Push), family member 2  
version 1.0, build 47, serial number 17295091, board revision 1

[Source](https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#213-device-inquiry)
