var easymidi = require('easymidi');
var push2keymap = require('./Push2Keymap');
var EventEmitter = require('events').EventEmitter;

module.exports = {
  MidiMonitor:class MidiMonitor{
    constructor(){
      this._inputs = [];
    }
    start(port='all'){
      // Monitor all MIDI inputs
      var self = this;
      easymidi.getInputs().forEach(function(inputName){
        var input = new easymidi.Input(inputName);
        if (port.toLowerCase()=='all'||port.toLowerCase()==inputName.toLowerCase()) self._inputs.push({name:inputName,obj:input});
      });
      this._inputs.forEach((input)=>{
        input.obj.on('message', function (msg) {
          var vals = Object.keys(msg).map(function(key){return key+": "+msg[key];});
          console.log(input.name+": "+vals.join(', '));
        });
      });
    }
    stop(){
      while(this._inputs.length>0){
        var input = this._inputs.pop();
        input.obj.close();
      }
    }
  },
  Push2:class Push2 extends EventEmitter {
    constructor(port='both',virtual=false){
      super();
      this._inputs = [];
      this._outputs = [];
      this._ports=[];
      if (port.toLowerCase()=='user') this._ports.push('User');
      else if (port.toLowerCase()=='live') this._ports.push('Live');
      else if (port.toLowerCase()=='both') this._ports = ['User','Live'];
      else throw `Expected port to be 'user', 'live', or 'both', but got: ${port}`;
      this._ports=this._ports.map((name)=>`Ableton Push 2 ${name} Port`);
      this._virtual = virtual;
      this.listen();
    }
    _openOutputPorts(){
      var self = this;
      this._ports.forEach((name)=>this._outputs.push({name:name,obj:new easymidi.Output(name, self.virtual)}));
    }
    _openInputPorts(){
      var self = this;
      this._ports.forEach((name)=>this._inputs.push({name:name,obj:new easymidi.Input(name, self.virtual)}));
    }
    listen(){
      var self = this;
      this._openInputPorts();
      this._inputs.forEach((port)=>port.obj.on('message',(msg)=>{
        self.emit(msg._type,msg);
        self.emit('message',msg);
      }));
    }
    monitor(){
      if (this._inputs.length==0) this._openInputPorts();
      this._inputs.forEach((input)=>{
        input.obj.on('message', function (msg) {
          var buttonName;
          if (Object.keys(msg).includes('note')){
            buttonName = push2keymap.keys[msg.note];
          } else if (Object.keys(msg).includes('controller')){
            buttonName = push2keymap.controls[msg.controller];
          }
          if (msg._type=='noteon'){
            var toPrint = `\n ${buttonName} pressed`;
            if (msg.note>=36 && msg.note<=99) toPrint += `, velocity: ${msg.velocity}`;
            console.log(input.name,msg,toPrint);
          }
          else if (msg._type=='noteoff')
            console.log(input.name,msg,`\n ${buttonName} released`);
          else if (msg._type=='poly aftertouch')
            console.log(input.name,msg,`\n ${buttonName} pressure change to: ${msg.velocity}`);
          else if (msg._type=='cc')
            console.log(input.name,msg,`\n ${buttonName}: ${msg.value}`);
          else if (msg._type=='program')
            console.log(input.name,msg,`\n program: ${msg.program}`);
          else if (msg._type=='channel aftertouch')
            console.log(input.name,msg,`\n channel pressure change to: ${msg.pressure}`);
          else if (msg._type=='pitch')
            console.log(input.name,msg,`\n pitch bend position: ${msg.value}`);
          else if (msg._type=='position')
            console.log(input.name,msg,`\n control wheel position: ${msg.value}`);
          else console.log(input.name,msg,`\n message not understood: `,msg);
        });
      });
    }
    stopMonitor(){
      this._inputs.forEach((port)=>port.obj.removeAllListeners());
    }
    close(){
      this._inputs.forEach((port)=>port.obj.close());
      this._outputs.forEach((port)=>port.obj.close());
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
      } else if (typeof key == 'object') { // must be an array [track,scene]
        keyName = `pad ${key[0]},${key[1]}`;
        keyIndex = push2keymap.keysByName[keyName];
      }
      if (keyIndex == null) throw `${keyName} not found.`;
      if (this._outputs.length==0) this._openOutputPorts();
      if (keyName.slice(0,4)=="pad ") { // Must be for a pad control, use noteon
        this._outputs.forEach((port)=>port.obj.send('noteon', {
          note: keyIndex,
          velocity: paletteIdx,
          // channel: 0
        }));
      } else { // Must be a button, use cc
        this._outputs.forEach((port)=>port.obj.send('cc', {
          controller: keyIndex,
          value: paletteIdx,
          // channel: 0
        }));
      }
    }
  }
};
