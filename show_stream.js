var MidiStream = require('midi-stream');
var p2km = require('./Push2Keymap');
var sysexCommands = require('./Push2SysexCommands');
var MidiMessage = require('./MidiMessage');

['Ableton Push 2 Live Port','Ableton Push 2 User Port'].forEach((portName)=>{
    MidiStream(portName).on('data', (data) => {
    //console.log(`${portName} received message: ${data}`);
    var msg = new MidiMessage(data);
    console.debug(msg);
    var buttonName = "";
    var toPrint = `${msg.message}`;
    if (Object.keys(msg).includes('key')) toPrint += ` "${p2km.keys[msg.key]}"`;
    if (Object.keys(msg).includes('control')) toPrint += ` "${p2km.controls[msg.control]}"`;
    if (msg.command) toPrint += ` "${msg.command}"`;
    if (msg.mode) toPrint += ` mode: ${msg.mode}`;
    else if (Object.keys(msg).includes('value')) toPrint +=  ` value: ${msg.value}`;
    console.log(toPrint);
  });
});
