var easymidi = require('easymidi');
var push2keymap = require('./Push2Keymap');
var EventEmitter = require('events').EventEmitter;

class Midi extends EventEmitter {
  constructor(portName='Ableton Push 2 User Port',virtual=false){
    super();
    console.log(`Initializing ${portName}`);
    this._input = new easymidi.Input(portName,virtual);
    this._output = new easymidi.Output(portName,virtual);
    this._input.on('message',(msg)=>{
      // Emit all messages as 'message' events, plus each individual type separately.
      this.emit(msg._type,msg);
      this.emit('message',msg);
    });
  }
  send(messageType,message){
    this._output.send(messageType,message);
  }
  removeAllListeners(){
    this._input.removeAllListeners();
  }
  close() {
    this._input.close();
    this._output.close();
  }
}


module.exports = {
  Push2:class Push2 extends EventEmitter {
    constructor(port='user',virtual=false){
      super();
      this._virtual = virtual;
      port = port.toLowerCase();
      if (port !='live' && port != 'user') throw new Error("Expected port to be either 'user' or 'live'.");
      port = port[0].toUpperCase() + port.slice(1); // Capitalize the first letter
      this.portName = `Ableton Push 2 ${port} Port`;
      this.midi = new Midi(this.portName,virtual);
    }
    monitor(){
      var portName = this.portName;
      this.midi.on('message', this._printMessage.bind(this));
    }
    stopMonitor(){
      this.midi.removeListener('message', this._printMessage.bind(this));
    }
    close(){
      this.midi.close();
    }
    setColor(key,paletteIdx) {
      // key: key name from push2keymap
      // pad can also be an array containing [track,scene] with values [[1-8],[1-8]]
      // paletteIdx: color palette index [1-127]
      var keyIndex = null;
      var keyName = "";
      //if (typeof key == 'number') keyIndex=key;
      if (typeof key == 'string') { // must be a key name
        keyIndex = push2keymap.controlsByName[key];
        if (keyIndex==null) keyIndex = push2keymap.keysByName[key];
        keyName = key;
      } else if (typeof key == 'object') { // must be an array [track,scene]
        keyName = `pad ${key[0]},${key[1]}`;
        keyIndex = push2keymap.keysByName[keyName];
      }
      if (keyIndex == null) throw `${keyName} not found.`;
      console.log(`Setting color of ${keyName} (${keyIndex}) to ${paletteIdx}`);
      if (keyName.slice(0,4)=="pad ") { // Must be for a pad control, use noteon
        this.midi.send('noteon', {
          note: keyIndex,
          velocity: paletteIdx,
        });
      } else { // Must be a button, use cc
        this.midi.send('cc', {
          controller: keyIndex,
          value: paletteIdx,
        });
      }
    }
    _printMessage(msg) {
      var buttonName;
      if (Object.keys(msg).includes('note')){
        buttonName = push2keymap.keys[msg.note];
      } else if (Object.keys(msg).includes('controller')){
        buttonName = push2keymap.controls[msg.controller];
      }
      if (msg._type=='noteon'){
        var toPrint = ` ${buttonName} pressed`;
        if (msg.note>=36 && msg.note<=99) toPrint += `, velocity: ${msg.velocity}`;
        console.log(this.portName,toPrint,msg);
      }
      else if (msg._type=='noteoff')
        console.log(this.portName,` ${buttonName} released`,msg);
      else if (msg._type=='poly aftertouch')
        console.log(this.portName,` ${buttonName} pressure change to: ${msg.pressure}`,msg);
      else if (msg._type=='cc')
        console.log(this.portName,` ${buttonName}: ${msg.value}`,msg);
      else if (msg._type=='program')
        console.log(this.portName,` program: ${msg.program}`,msg);
      else if (msg._type=='channel aftertouch')
        console.log(this.portName,` channel pressure change to: ${msg.pressure}`,msg);
      else if (msg._type=='pitch')
        console.log(this.portName,` pitch bend position: ${msg.value}`,msg);
      else if (msg._type=='position')
        console.log(this.portName,` control wheel position: ${msg.value}`,msg);
      else console.log(this.portName,` message not understood: `,msg);
    }
  }
};
