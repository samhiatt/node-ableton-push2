let midi = require('midi-stream');
let deepEqual = require('deep-equal');

interface VirtualResponder {
  portName:string;
  midi:any;
  _aftertouchMode:number;
  _touchStripConfiguration:number;
  _globalLEDBrightness:number;
  _displayBrightness:number[];
  _midiMode:number;
  _colors:any;
}

class VirtualResponder{
  constructor(port='user'){
    port = port[0].toUpperCase()+port.toLowerCase().slice(1);
    this.portName = `Virtual Ableton Push 2 ${port} Port`;
    this.midi = midi(this.portName);
    this._aftertouchMode = 0;
    this._touchStripConfiguration = 0;
    this._globalLEDBrightness = 0;
    this._displayBrightness = [0,0];
    this._midiMode = 1;
    this._colors={127: [127,1,0,0,0,0,0,1]};
  }
  listen(){
    this.midi.on('data',(msg)=>{
      // console.log("Virtual device got ",msg);
      if (deepEqual(msg,[240, 126, 1, 6, 1, 247])) { // Get Device Identity
        // console.log("Get Identity request received");
        this.midi.write([240,126,1,6,2,0,33,29,103,50,2,0,1,0,60,0,58,31,37,8,0,1,247]);
      }
      else if (deepEqual(msg,[ 240,0,33,29,1,1,24,247 ])) { // Get touch strip configuration
        // console.log("Get touch strip configuration request received");
        this.midi.write([ 240, 0, 33, 29, 1, 1, 24, this._touchStripConfiguration, 247 ]);
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,23] )){  // set touch strip configuration
        // console.log("Get touch strip configuration request received",msg[7]);
        this._touchStripConfiguration = msg[7];
      }
      else if (deepEqual(msg, [240,0,33,29,1,1,31,247] )){  // get aftertouch mode
        // console.log("Get aftertouch mode request received",msg);
        this.midi.write([240,0,33,29,1,1,31,this._aftertouchMode,247]);
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,30] )){  // set aftertouch mode
        // console.log("Set aftertouch mode request received:",msg);
        this._aftertouchMode = msg[7];
      }
      else if (deepEqual(msg, [240,0,33,29,1,1,7,247])){  // get global LED brightness
        // console.log("Get global LED brightness request received",msg);
        this.midi.write([240,0,33,29,1,1,7,this._globalLEDBrightness,247]);
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,6])){  // set global LED brightness
        // console.log("Set global LED brightness request received",msg);
        this._globalLEDBrightness = msg[7];
      }
      else if (deepEqual(msg, [240,0,33,29,1,1,9,247])){  // get display brightness
        // console.log("Get display brightness request received",this._displayBrightness[0],this._displayBrightness[1]);
        this.midi.write([240,0,33,29,1,1,9,this._displayBrightness[0],this._displayBrightness[1],247]);
      }
      else if (deepEqual(msg, [240,0,33,29,1,1,26,1,247])){  // get statistics
        // console.log("Get statistics request received");
        this.midi.write([240,0,33,29,1,1,26,1,1,99,8,0,0,0,247]);
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,4])){  // get LED color palette entry
        // console.log("Get LED color palette entry request received",msg);
        let bytes = [240,0,33,29,1,1,4,msg[7]];
        this._colors[msg[7]].forEach((c)=>{bytes.push(c);});
        bytes.push(247);
        this.midi.write(bytes);
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,8])){  // set display brightness
        // console.log("Set display brightness request received",msg);
        this._displayBrightness = [msg[7],msg[8]];
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,10])){  // set MIDI mde
        // console.log("Set MIDI mode request received",msg);
        this._midiMode = msg[7];
        this.midi.write([240,0,33,29,1,1,10,1,247]);
      }
      else if (deepEqual(msg.slice(0,7), [240,0,33,29,1,1,3])){  // set color 127 to green
        // console.log("Set color palette entry request received",msg);
        this._colors[msg[7]] = msg.slice(8,-1);
      } else console.log("Unhandled message received:",msg);
    });
  }
  close(){
    this.midi.removeAllListeners();
    this.midi.close();
  }
}

module.exports = VirtualResponder;
