import easymidi = require('easymidi');
var push2keymap = require('./Push2Keymap');

import {EventEmitter} from 'events';
import {TouchStripConfiguration} from './TouchStripConfiguration';
import {DeviceIdentity} from './DeviceIdentity';
import {DeviceStatistics} from './DeviceStatistics';
import assert = require("assert");

export interface Midi {
  _input:any;
  _output:any;
}

/**
* Access to MIDI events through [easymidi](https://github.com/dinchak/node-easymidi) interface.
*/
export class Midi extends EventEmitter {
  constructor(portName:string='Ableton Push 2 User Port',virtual:boolean=false){
    super();
    // console.log(`Initializing ${portName}`);
    // console.log("Available MIDI inputs: ", easymidi.getInputs());
    // console.log("Available MIDI Outputs: ", easymidi.getOutputs());
    // var _inputPortName = easymidi.getInputs().filter((val,i,arr)=>{
    //     console.log(val, val.startsWith('Ableton'));
    //     return val.startsWith("Ableton");
    // });
    var _inputPorts = easymidi.getInputs().filter((val,i,arr)=>val.startsWith(portName));
    if (_inputPorts.length == 0) {
      throw new Error("No MIDI input for "+portName);
    }
    var _outputPorts = easymidi.getOutputs().filter((val,i,arr)=>val.startsWith(portName));
    if (_outputPorts.length == 0) {
      throw new Error("No MIDI output for "+portName);
    }
    this._input = new easymidi.Input(_inputPorts[0], virtual);
    this._output = new easymidi.Output(_outputPorts[0], virtual);
    this._input.on('message',(msg)=>{
      // Emit all messages as 'message' events, plus each individual type separately.
      this.emit(msg._type,msg);
      this.emit('message',msg);
    });
  }
  /**
  * Send a midi message.
  * See [midi documentation](doc/midi.md#midi-message-event-types) for message types.
  */
  send(messageType:string,message:{[t:string]:number}|number[]){
    this._output.send(messageType,message);
  }
  removeAllListeners(event?:string|symbol){
    this._input.removeAllListeners(event);
    return this;
  }
  /**
  * Remove event listeners and close ports.
  */
  close() {
    this.removeAllListeners();
    this._input.close();
    this._output.close();
  }
}

interface SysexResponse{
  bytes:number[];
}
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}
export interface Push2 {
  isVirtual:boolean;
  deviceId:DeviceIdentity;
  touchStripConfiguration:TouchStripConfiguration;
  portName:string;
  midi:Midi;
}

export interface Scene8track {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
}

export interface Grid8x8 {
  1: Scene8track;
  2: Scene8track;
  3: Scene8track;
  4: Scene8track;
  5: Scene8track;
  6: Scene8track;
  7: Scene8track;
  8: Scene8track;
}

// var MIDIMODES = new Enum({LIVE:0,USER:1,BOTH:2}, {ignoreCase:true});
export enum MIDIMODES {
  live=0,
  user=1,
  both=2,
}
// var ports = new Enum({LIVE:0,USER:1}, {ignoreCase:true});
export enum PORTS {
  live=0,
  user=1,
}
// var AFTERTOUCHMODES = new Enum({CHANNEL:0,POLY:1}, {ignoreCase:true});
export enum AFTERTOUCHMODES {
  channel=0,
  poly=1,
}

/**
* ## Push2 Controller Object
* Opens a connection to a physical, connected Push 2 device, or alternatively a virtual port.
* Implements the functions described in the [Ableton Push 2 MIDI And Display Interface Manual](
*  https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc).
* #### Quick start:
* ```javascript
* var ableton = require('ableton-push2');
* var push2 = new ableton.Push2(port='user'); // Boom! A New Ableton Push 2!!
* push2.setColor([2,3],30); 		 // Set track 2, scene 3 to color index 30
* ```
*/
export class Push2 extends EventEmitter {
  /**
  * @param port 'user' or 'live'
  * @param virtual Opens a virtual software port
  */
  constructor(port:string='user',virtual:boolean=false){
    super();
    this.isVirtual = virtual;
    this.deviceId = null;
    this.touchStripConfiguration = null;
    port = port.toLowerCase();
    if (!PORTS.propertyIsEnumerable(port))
      throw new Error("Expected port to be 'user' or 'live'.");
    //port = port[0].toUpperCase() + port.toLowerCase().slice(1); // Capitalize the first letter
    //this.portName = `${virtual?'Virtual ':''}Ableton Push 2 ${port} Port`;
    this.portName = "Ableton Push 2";
    this.midi = new Midi(this.portName,virtual);
    this.getDeviceId();
    // this.getTouchStripConfiguration();
  }
  monitor():void {
    this.midi.on('message', this._printMessage.bind(this));
  }
  stopMonitor():void {
    this.midi.removeListener('message', this._printMessage.bind(this));
  }
  close():void {
    this.midi.close();
  }
  setColor(key,paletteIdx):void {
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
    // console.log(`Setting color of ${keyName} (${keyIndex}) to ${paletteIdx}`);
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
  getDeviceId():Promise<DeviceIdentity> {
    var self= this;
    return new Promise(function (resolve, reject) {
      self.midi.on('sysex',function handler(msg) {
        if (msg.bytes[4]==2) { // device identity reply
          self.midi.removeListener('sysex',handler);
          self.deviceId = new DeviceIdentity(msg.bytes);
          self.emit('device-id',self.deviceId);
          resolve(self.deviceId);
        }
      });
      self.midi.send('sysex',[240, 126, 1, 6, 1, 247]);
      setTimeout(()=>{ // reject if no usable response after 1 second.
        reject(new Error("No device inquiry reponse received."));
      },1000);
    });
  }
  getTouchStripConfiguration():Promise<TouchStripConfiguration> {
    return this._getParamPromise(0x18,(resp,resolve)=>{
      this.touchStripConfiguration = new TouchStripConfiguration(resp.bytes[7]);
      this.emit('received_touchStripConfiguration',this.touchStripConfiguration);
      resolve(this.touchStripConfiguration);
    });
  }
  setTouchStripConfiguration(val):Promise<TouchStripConfiguration> {
    // If val is undefined will reset touch strip configuration to default.
    return new Promise((resolve,reject)=>{
      var sendCommand = (encoded)=>{
        var conf = new TouchStripConfiguration(encoded);
        this._sendSysexCommand([0x17,conf.getByteCode()]);
        this.getTouchStripConfiguration().then((currentConf)=>{ // Validate response
          Object.keys(this.touchStripConfiguration).forEach((prop)=>{
            if (conf[prop]!=currentConf[prop])
              reject(new Error("Current config does not match the config just attempted to set."+
              " Current config is:"+currentConf));
          });
          resolve(conf);
        }).catch(reject);
      };
      if (typeof val=='undefined') sendCommand(0);
      else if (typeof val == 'object') {
        // If an object is provided, will first get current config and then merge in options.
        return this.getTouchStripConfiguration().then((conf:TouchStripConfiguration)=>{
          Object.keys(this.touchStripConfiguration).forEach((key)=> {
            if (typeof val[key]!='undefined') conf[key]=val[key];
          });
          sendCommand(conf.getByteCode());
        }).catch(reject);
      } else if (typeof val == 'number') {
        sendCommand(val);
      }
      else reject(new Error("Expected val to be either a number or an object."));
    });
  }
  setTouchStripLEDs(brightnessArray):Promise<null> {
    // Uses sysex message to set LEDs.
    // brightnessArray should be an array of 31 brightness values from 0-7 where
    // brightnessArray[0] is the bottom LED, brightnessArray[30] is the top LED.
    if (brightnessArray.length!=31) throw new Error("Expected brightnessArray of length 31");
    return new Promise((resolve,reject)=>{
      var bytes = [0x19];
      for (let i=0; i<16; i++){
        bytes.push( ((i!=15)?(brightnessArray[i*2+1])<<3 : 0)  | (brightnessArray[i*2]) );
      }
      // Lets make sure the set 'LEDsControlledByHost' and 'hostSendsSysex' to enable control.
      return this.setTouchStripConfiguration({'LEDsControlledByHost':1,'hostSendsSysex':1}).then((conf)=>{
        // No need to wait for response since there is no "getTouchStripLEDs" command
        this._sendSysexCommand(bytes);
        resolve(null);
      }).catch(reject);
    });
  }
  getGlobalLEDBrightness():Promise<number> {
    return this._getParamPromise(0x07,(resp,next)=>{
      next(resp.bytes[7]);
    });
  }
  setGlobalLEDBrightness(val):Promise<void> {
    var bytes = [0x06];
    bytes.push(val);
    return this._sendCommandAndValidate(bytes).catch((err)=>{
      throw new Error("Tried setting global LED brightness, but new value doesn't match. "+err);
    });
    // return this._sendSysexCommand(bytes);
  }
  setMidiMode(mode):Promise<void> {
    if (!MIDIMODES.propertyIsEnumerable(mode))
      throw new Error("Expected mode to be 'user', 'live', or 'both'.");
    return this._sendSysexRequest([0x0a, MIDIMODES[mode]]).then((resp:SysexResponse)=>{
      if (MIDIMODES[resp.bytes[7]]!=(MIDIMODES[MIDIMODES[mode]]))  // Workaround typecript compiler error
        throw new Error(`Tried to set MIDI mode to "${mode}" but responded with mode "${MIDIMODES[resp.bytes[7]]}"`);
    });
  }
  getDisplayBrightness():Promise<number> {
    return this._getParamPromise(0x09,(resp,next)=>{
      next( resp.bytes[7] | resp.bytes[8]<<7 );
    });
  }
  setDisplayBrightness(val):Promise<void> {
    var req = [0x08, val&127, val>>7];
    return this._sendCommandAndValidate(req).catch((err)=>{
      throw new Error("Tried setting display brightness, but new value doesn't match. "+err);
    });
    // this._sendSysexCommand(req);
  }
  getLEDColorPaletteEntry(paletteIdx:number):Promise<{r:number, g:number, b:number, a:number}> {
    var decode = (lower7bits:number, higher1bit:number):number=>{
      return lower7bits | higher1bit << 7;
    };
    return this._getParamPromise([0x04,paletteIdx],(resp,next)=>{
      next({
        r:decode(resp.bytes[8],resp.bytes[9]),
        g:decode(resp.bytes[10],resp.bytes[11]),
        b:decode(resp.bytes[12],resp.bytes[13]),
        a:decode(resp.bytes[14],resp.bytes[15]),
      });
    });
  }
  setLEDColorPaletteEntry(paletteIdx:number, color:Color,validate:false):Promise<void>|void {
    if (paletteIdx<0 || paletteIdx>127) throw new Error("paletteIdx should be 0-127.");
    var bytes=[0x03, paletteIdx];
    bytes.push(color.r & 127);
    bytes.push(color.r >> 7);
    bytes.push(color.g & 127);
    bytes.push(color.g >> 7);
    bytes.push(color.b & 127);
    bytes.push(color.b >> 7);
    bytes.push(color.a & 127);
    bytes.push(color.a >> 7);
    if (validate) return this._sendCommandAndValidate(bytes);
    else this._sendSysexCommand(bytes);
  }
  reapplyColorPalette():void {
    // trigger palette reapplication
    this._sendSysexCommand(0x05);
  }
  setAftertouchMode(mode):Promise<void> {
    // mode = mode.toLowerCase();
    if (!AFTERTOUCHMODES[mode])
      throw new Error(`Expected mode to be one of ${AFTERTOUCHMODES}.`);
    return this._sendCommandAndValidate([0x1e, AFTERTOUCHMODES[mode]]);
  }
  getAftertouchMode():Promise<string> {
    return this._getParamPromise([0x1f],(resp,next)=>{
      next(resp.bytes[7]==0?'channel':'poly');
    });
  }
  getStatistics():Promise<number[]> {
    return this._getParamPromise([0x1a,0x01],(resp,next)=>{
      next(new DeviceStatistics(resp.bytes));
    });
  }
  async getSelectedPadSensitivity(scene:number, track:number):Promise<number> {
    return await this._getParamPromise([0x29, scene, track], (resp,next)=>{
      next(resp.bytes[9]);
    });
  }
  async getPadSensitivitySettings():Promise<{}> {
    // return new Promise(async (resolve, reject) => {
    var padSettings = {};
    for (var scene = 1; scene < 9; scene++) {
      padSettings[scene] = {};
      for (var track = 1; track < 9; track++) {
        padSettings[scene][track] = await this.getSelectedPadSensitivity(scene, track).catch((err)=>{
          console.error(`Unable to set pad sensitivity for scene ${scene}, track ${track}: ${err}`);
          throw err;
        });
      }
    }
    return padSettings;
    // });
  }
  get400gPadValuesForScene(scene: number):Promise<Scene8track> {
    assert(scene>=0 && scene<=8, "'scene' should be a number from 1 to 8.");
    return this._getParamPromise([0x1D, scene], (resp, next)=>{
      var vals = resp.bytes.slice(8, -1);
      var res = {};
      for (var i=0; i<8; i++) {
        res[i+1] = vals[i*2] | vals[i*2+1]<<7;
      }
      next(res);
    });
  }
  async get400gPadValues():Promise<Grid8x8> {
    var res = <Grid8x8>{};
    for (var i=0; i<8; i++){
      res[i+1] = await this.get400gPadValuesForScene(i+1);
    }
    return res;
  }
  private _getParamPromise(commandId,responseHandler):Promise<any> {
    return new Promise((resolve,reject)=>{
      if (typeof commandId=='number') commandId = [commandId];
      return this._sendSysexRequest(commandId).then((resp)=>{
        responseHandler(resp,resolve);
      }).catch(reject);
    });
  }
  private _sendCommandAndValidate(command):Promise<void> { // Sends a command, then validates
    this._sendSysexCommand(command);
    // This relies on the assumption that the command id for 'get'
    // commands is the 'set' commandId +1
    return this._getParamPromise(command[0]+1,(resp,next)=>{
      // resp.bytes.slice(7,-1) should equal command.slice(1)
      var bytesValid = command.slice(1).map((v,i)=>v==resp.bytes[i+7]);
      if (bytesValid.includes(false))
        throw new Error(`Error validating setting. Sent ${command.slice(1)},`+
          ` but setting is currently ${resp.bytes.slice(7,-1)}.`);
      else next();
    });
  }
  private _sendSysexCommand(msg):void {
    // Adds sysex message header and 0xf7 footer, then sends command.
    //[F0 00 21 1D 01 01 ... ... ... F7];
    var a = [0xf0, 0x00, 0x21, 0x1d, 0x01, 0x01 ];
    if (typeof msg=='number') msg = [msg];
    msg.forEach((v)=>a.push(v));
    a.push(0xf7);
    // console.log("Sending sysex command:",a.map((v)=>{return v.toString(16);}));
    this.midi.send('sysex',a);
  }
  private _sendSysexRequest(msg):Promise<SysexResponse> {
    // Sends a sysex request and handles response. Throws error if no respone received after 1 second.
    return new Promise((resolve, reject)=>{
      var commandId = msg[0];
      setTimeout(()=>{ // reject if no usable response after 1 second.
        reject(new Error("No usable sysex response message received."));
      },1000);
      // TODO: Set up only one listener, use to handle all messages.
      this.midi.setMaxListeners(100);
      this.midi.on('sysex',function handler(resp) {
        if (resp.bytes[6]==commandId){ // This response matches our request.
          // console.log("Waiting for "+commandId+" Got SYSEX:",resp);
          this.midi.removeListener('sysex',handler);
          resolve(resp);
        // } else {
        //   console.warn(`Received sysex message, but command id didn't match. Sent: ${msg} and got ${resp.bytes}`);
        }
      }.bind(this));
      this._sendSysexCommand(msg);
    });
  }
  private _printMessage(msg):void {
    var buttonName;
    if (msg.note){
      buttonName = push2keymap.keys[msg.note];
    } else if (msg.controller){
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
    //else console.log(this.portName,` message not understood: `,msg);
  }
}
module.exports = Push2;
