//Summary of MIDI Messages from MIDI spec:
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
var p2sysex = require('./Push2SysexCommands');

class MidiMessage {
  constructor(messageArray) {
    var midiMessages={
      128:"note off",
      144:"note on",
      160:"polyphonic key pressure",
      176:"control change", // see table Channel Mode Messages for reserved controller numbers 120-127
      192:"program change",
      208:"channel pressure",
      224:"pitch bend change",
      240:"system common message",
    };
    this.statusCode = messageArray[0];
    var message = midiMessages[messageArray[0]];
    if (!message) {
      console.warn("status code not understood.",messageArray);
      return;
    }
    this.message = message;
    if (this.statusCode==128 || this.statusCode==144 || this.statusCode==160) {
      if (messageArray.length != 3) throw "Received unexpected number of parameters";
      this.key = messageArray[1];
      this.value = messageArray[2];
    } else if (this.statusCode==176) { // control change
      if (messageArray.length != 3) throw "Received unexpected number of parameters";
      this.control = messageArray[1];
      this.value = messageArray[2];
    } else if (this.statusCode==192 || this.statusCode==208 ) {
      this.value = messageArray[1];
    } else if (this.statusCode==224) {
      this.value = messageArray[2];
    } else if (messageArray[0]==240&&messageArray[1]==0&&
              messageArray[2]==33&&messageArray[3]==29&&
              messageArray[4]==1&&messageArray[5]==1){
      // sysex command  [ 240, 0, 33, 29, 1, 1, ${commandId}, ${value}, 247 ]
      this.commandId = messageArray[6];
      var command = p2sysex.commands[this.commandId];
      this.command = command.name;
      if (Object.keys(command).includes('mode')){
        this.mode = command.mode[messageArray[7]];
      }
      //this.value = messageArray.slice(7,messageArray.length-1);

    }
  }
}
module.exports = MidiMessage;
