// reference: https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc

// Sysex commands are of the form:
// [0xF0 0x00 0x21 0x1D 0x01 0x01 ${commandId.toString(2)} ${val1.toString(2)} ${val2...} 0xF7]
var aftertouchModes = {0:"channel pressure",1:"polyphonic key pressure"};

// Configuration Flags
//   ---------------
// bit |6|5|4|3|2|1|0|
//   ---------------                     |   0         |   1
//    | | | | | | |  --------------------+-------------+----------
//    | | | | | | --- LEDs Controlled By | Push 2*     | Host
//    | | | | | ----- Host Sends         | Values*     | Sysex
//    | | | | ------- Values Sent As     | Pitch Bend* | Mod Wheel
//    | | | --------- LEDs Show          | a Bar       | a Point*
//    | | ----------- Bar Starts At      | Bottom*     | Center
//    | ------------- Do Autoreturn      | No          | Yes*
//    --------------- Autoreturn To      | Bottom      | Center*
//
// *) The default settings are marked in bold.

exports.commands = {
  10:{name:"get/set midi mode", mode:{0:"live", 1:"user", 2:"dual"}}, // 0x0A  MIDI mode (0=Live, 1=User, 2=Dual)
  33:{name:"get pad velocity curve entry",params:["index"]}, // 0x21
  30:{name:"set aftertouch mode", mode:aftertouchModes}, // 0x1e
  31:{name:"get aftertouch mode", mode:aftertouchModes}, // 0x1f
  24:{name:"get touch strip configuration", params:["configuration"]},
  23:{name:"set touch strip configuration", params:["configuration"]},
};
