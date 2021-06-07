"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Push2 = exports.AFTERTOUCHMODES = exports.PORTS = exports.MIDIMODES = exports.SENSITIVITY = exports.Midi = void 0;
const easymidi = require("easymidi");
var push2keymap = require('./Push2Keymap');
const events_1 = require("events");
const TouchStripConfiguration_1 = require("./TouchStripConfiguration");
const DeviceIdentity_1 = require("./DeviceIdentity");
const DeviceStatistics_1 = require("./DeviceStatistics");
const assert = require("assert");
/**
* Access to MIDI events through [easymidi](https://github.com/dinchak/node-easymidi) interface.
*/
class Midi extends events_1.EventEmitter {
    constructor(portName = 'Ableton Push 2 User Port', virtual = false) {
        super();
        // console.log(`Initializing ${portName}`);
        // console.log("Available MIDI inputs: ", easymidi.getInputs());
        // console.log("Available MIDI Outputs: ", easymidi.getOutputs());
        // var _inputPortName = easymidi.getInputs().filter((val,i,arr)=>{
        //     console.log(val, val.startsWith('Ableton'));
        //     return val.startsWith("Ableton");
        // });
        var _inputPorts = easymidi.getInputs().filter((val, i, arr) => val.startsWith(portName));
        if (_inputPorts.length == 0) {
            throw new Error("No MIDI input for " + portName);
        }
        var _outputPorts = easymidi.getOutputs().filter((val, i, arr) => val.startsWith(portName));
        if (_outputPorts.length == 0) {
            throw new Error("No MIDI output for " + portName);
        }
        this._input = new easymidi.Input(_inputPorts[0], virtual);
        this._output = new easymidi.Output(_outputPorts[0], virtual);
        this._input.on('message', (msg) => {
            // Emit all messages as 'message' events, plus each individual type separately.
            this.emit(msg._type, msg);
            this.emit('message', msg);
        });
    }
    /**
    * Send a midi message.
    * See [midi documentation](doc/midi.md#midi-message-event-types) for message types.
    */
    send(messageType, message) {
        this._output.send(messageType, message);
    }
    removeAllListeners(event) {
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
exports.Midi = Midi;
var SENSITIVITY;
(function (SENSITIVITY) {
    SENSITIVITY[SENSITIVITY["regular"] = 0] = "regular";
    SENSITIVITY[SENSITIVITY["reduced"] = 1] = "reduced";
    SENSITIVITY[SENSITIVITY["low"] = 1] = "low";
})(SENSITIVITY = exports.SENSITIVITY || (exports.SENSITIVITY = {}));
// var MIDIMODES = new Enum({LIVE:0,USER:1,BOTH:2}, {ignoreCase:true});
var MIDIMODES;
(function (MIDIMODES) {
    MIDIMODES[MIDIMODES["live"] = 0] = "live";
    MIDIMODES[MIDIMODES["user"] = 1] = "user";
    MIDIMODES[MIDIMODES["both"] = 2] = "both";
})(MIDIMODES = exports.MIDIMODES || (exports.MIDIMODES = {}));
// var ports = new Enum({LIVE:0,USER:1}, {ignoreCase:true});
var PORTS;
(function (PORTS) {
    PORTS[PORTS["live"] = 0] = "live";
    PORTS[PORTS["user"] = 1] = "user";
})(PORTS = exports.PORTS || (exports.PORTS = {}));
// var AFTERTOUCHMODES = new Enum({CHANNEL:0,POLY:1}, {ignoreCase:true});
var AFTERTOUCHMODES;
(function (AFTERTOUCHMODES) {
    AFTERTOUCHMODES[AFTERTOUCHMODES["channel"] = 0] = "channel";
    AFTERTOUCHMODES[AFTERTOUCHMODES["poly"] = 1] = "poly";
})(AFTERTOUCHMODES = exports.AFTERTOUCHMODES || (exports.AFTERTOUCHMODES = {}));
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
class Push2 extends events_1.EventEmitter {
    /**
    * @param port 'user' or 'live'
    * @param virtual Opens a virtual software port
    */
    constructor(port = 'user', virtual = false) {
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
        this.midi = new Midi(this.portName, virtual);
        this.getDeviceId();
        // this.getTouchStripConfiguration();
    }
    monitor() {
        this.midi.on('message', this._printMessage.bind(this));
    }
    stopMonitor() {
        this.midi.removeListener('message', this._printMessage.bind(this));
    }
    close() {
        this.midi.close();
    }
    setColor(key, paletteIdx) {
        // key: key name from push2keymap
        // pad can also be an array containing [track,scene] with values [[1-8],[1-8]]
        // paletteIdx: color palette index [1-127]
        var keyIndex = null;
        var keyName = "";
        //if (typeof key == 'number') keyIndex=key;
        if (typeof key == 'string') { // must be a key name
            keyIndex = push2keymap.controlsByName[key];
            if (keyIndex == null)
                keyIndex = push2keymap.keysByName[key];
            keyName = key;
        }
        else if (typeof key == 'object') { // must be an array [track,scene]
            keyName = `pad ${key[0]},${key[1]}`;
            keyIndex = push2keymap.keysByName[keyName];
        }
        if (keyIndex == null)
            throw `${keyName} not found.`;
        // console.log(`Setting color of ${keyName} (${keyIndex}) to ${paletteIdx}`);
        if (keyName.slice(0, 4) == "pad ") { // Must be for a pad control, use noteon
            this.midi.send('noteon', {
                note: keyIndex,
                velocity: paletteIdx,
            });
        }
        else { // Must be a button, use cc
            this.midi.send('cc', {
                controller: keyIndex,
                value: paletteIdx,
            });
        }
    }
    getDeviceId() {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.midi.on('sysex', function handler(msg) {
                if (msg.bytes[4] == 2) { // device identity reply
                    self.midi.removeListener('sysex', handler);
                    self.deviceId = new DeviceIdentity_1.DeviceIdentity(msg.bytes);
                    self.emit('device-id', self.deviceId);
                    resolve(self.deviceId);
                }
            });
            self.midi.send('sysex', [240, 126, 1, 6, 1, 247]);
            setTimeout(() => {
                reject(new Error("No device inquiry reponse received."));
            }, 1000);
        });
    }
    getTouchStripConfiguration() {
        return this._getParamPromise(0x18, (resp, resolve) => {
            this.touchStripConfiguration = new TouchStripConfiguration_1.TouchStripConfiguration(resp.bytes[7]);
            this.emit('received_touchStripConfiguration', this.touchStripConfiguration);
            resolve(this.touchStripConfiguration);
        });
    }
    setTouchStripConfiguration(val) {
        // If val is undefined will reset touch strip configuration to default.
        return new Promise((resolve, reject) => {
            var sendCommand = (encoded) => {
                var conf = new TouchStripConfiguration_1.TouchStripConfiguration(encoded);
                this._sendSysexCommand([0x17, conf.getByteCode()]);
                this.getTouchStripConfiguration().then((currentConf) => {
                    Object.keys(this.touchStripConfiguration).forEach((prop) => {
                        if (conf[prop] != currentConf[prop])
                            reject(new Error("Current config does not match the config just attempted to set." +
                                " Current config is:" + currentConf));
                    });
                    resolve(conf);
                }).catch(reject);
            };
            if (typeof val == 'undefined')
                sendCommand(0);
            else if (typeof val == 'object') {
                // If an object is provided, will first get current config and then merge in options.
                return this.getTouchStripConfiguration().then((conf) => {
                    Object.keys(this.touchStripConfiguration).forEach((key) => {
                        if (typeof val[key] != 'undefined')
                            conf[key] = val[key];
                    });
                    sendCommand(conf.getByteCode());
                }).catch(reject);
            }
            else if (typeof val == 'number') {
                sendCommand(val);
            }
            else
                reject(new Error("Expected val to be either a number or an object."));
        });
    }
    setTouchStripLEDs(brightnessArray) {
        // Uses sysex message to set LEDs.
        // brightnessArray should be an array of 31 brightness values from 0-7 where
        // brightnessArray[0] is the bottom LED, brightnessArray[30] is the top LED.
        if (brightnessArray.length != 31)
            throw new Error("Expected brightnessArray of length 31");
        return new Promise((resolve, reject) => {
            var bytes = [0x19];
            for (let i = 0; i < 16; i++) {
                bytes.push(((i != 15) ? (brightnessArray[i * 2 + 1]) << 3 : 0) | (brightnessArray[i * 2]));
            }
            // Lets make sure the set 'LEDsControlledByHost' and 'hostSendsSysex' to enable control.
            return this.setTouchStripConfiguration({ 'LEDsControlledByHost': 1, 'hostSendsSysex': 1 }).then((conf) => {
                // No need to wait for response since there is no "getTouchStripLEDs" command
                this._sendSysexCommand(bytes);
                resolve(null);
            }).catch(reject);
        });
    }
    getGlobalLEDBrightness() {
        return this._getParamPromise(0x07, (resp, next) => {
            next(resp.bytes[7]);
        });
    }
    setGlobalLEDBrightness(val) {
        var bytes = [0x06];
        bytes.push(val);
        return this._sendCommandAndValidate(bytes).catch((err) => {
            throw new Error("Tried setting global LED brightness, but new value doesn't match. " + err);
        });
        // return this._sendSysexCommand(bytes);
    }
    setMidiMode(mode) {
        if (!MIDIMODES.propertyIsEnumerable(mode))
            throw new Error("Expected mode to be 'user', 'live', or 'both'.");
        return this._sendSysexRequest([0x0a, MIDIMODES[mode]]).then((resp) => {
            if (MIDIMODES[resp.bytes[7]] != (MIDIMODES[MIDIMODES[mode]])) // Workaround typecript compiler error
                throw new Error(`Tried to set MIDI mode to "${mode}" but responded with mode "${MIDIMODES[resp.bytes[7]]}"`);
        });
    }
    getDisplayBrightness() {
        return this._getParamPromise(0x09, (resp, next) => {
            next(resp.bytes[7] | resp.bytes[8] << 7);
        });
    }
    setDisplayBrightness(val) {
        var req = [0x08, val & 127, val >> 7];
        return this._sendCommandAndValidate(req).catch((err) => {
            throw new Error("Tried setting display brightness, but new value doesn't match. " + err);
        });
        // this._sendSysexCommand(req);
    }
    getLEDColorPaletteEntry(paletteIdx) {
        var decode = (lower7bits, higher1bit) => {
            return lower7bits | higher1bit << 7;
        };
        return this._getParamPromise([0x04, paletteIdx], (resp, next) => {
            next({
                r: decode(resp.bytes[8], resp.bytes[9]),
                g: decode(resp.bytes[10], resp.bytes[11]),
                b: decode(resp.bytes[12], resp.bytes[13]),
                a: decode(resp.bytes[14], resp.bytes[15]),
            });
        });
    }
    setLEDColorPaletteEntry(paletteIdx, color, validate) {
        if (paletteIdx < 0 || paletteIdx > 127)
            throw new Error("paletteIdx should be 0-127.");
        var bytes = [0x03, paletteIdx];
        bytes.push(color.r & 127);
        bytes.push(color.r >> 7);
        bytes.push(color.g & 127);
        bytes.push(color.g >> 7);
        bytes.push(color.b & 127);
        bytes.push(color.b >> 7);
        bytes.push(color.a & 127);
        bytes.push(color.a >> 7);
        if (validate)
            return this._sendCommandAndValidate(bytes);
        else
            this._sendSysexCommand(bytes);
    }
    reapplyColorPalette() {
        // trigger palette reapplication
        this._sendSysexCommand(0x05);
    }
    setAftertouchMode(mode) {
        mode = mode.toLowerCase();
        if (!AFTERTOUCHMODES[mode])
            throw new Error(`Expected mode to be one of ${AFTERTOUCHMODES}.`);
        this._sendSysexCommand([0x1e, AFTERTOUCHMODES[mode]]);
    }
    getAftertouchMode() {
        return this._getParamPromise([0x1f], (resp, next) => {
            next(resp.bytes[7] == 0 ? 'channel' : 'poly');
        });
    }
    getStatistics() {
        return this._getParamPromise([0x1a, 0x01], (resp, next) => {
            next(new DeviceStatistics_1.DeviceStatistics(resp.bytes));
        });
    }
    setAftertouchThresholds(lowerThreshold, upperThreshold) {
        assert(lowerThreshold >= 400 && lowerThreshold <= 4095, "'lowerThreshold' should be a number from 400..4095.");
        assert(upperThreshold >= 400 && upperThreshold <= 4095, "'upperThreshold' should be a number from 400..4095.");
        assert(upperThreshold >= lowerThreshold, "'lowerThreshold' must be less than 'upperThreshold'");
        this._sendSysexCommand([0x1B, 0, 0, 0, 0,
            lowerThreshold & 127, lowerThreshold >> 7, upperThreshold & 127, upperThreshold >> 7]);
    }
    getLEDWhiteBalance(colorGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(colorGroup >= 0 && colorGroup <= 10, "'colorGroup' should be a number from 1 to 10.");
            return yield this._getParamPromise([0x15, colorGroup], (resp, next) => {
                next(resp.bytes[8] | resp.bytes[9] << 7);
            });
        });
    }
    samplePedalData(n) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sample pedal data accumulating the ADC readings of the 4 pedal wires (left/right jack, tip/ring contact)
            // over a certain sample count and return the averages for each of the wires.
            // Sample pedal data for 512 samples (29, approx 0.4 sec)
            // n: log2 of number of samples to average (0..19)
            assert(n >= 0 && n <= 19, "'n' should be a number from 0 to 19.");
            return yield this._getParamPromise([0x13, n], (resp, next) => {
                next({
                    right: {
                        ring: resp.bytes[7] | resp.bytes[8] << 7,
                        tip: resp.bytes[9] | resp.bytes[10] << 7,
                    },
                    left: {
                        ring: resp.bytes[11] | resp.bytes[12] << 7,
                        tip: resp.bytes[13] | resp.bytes[14] << 7,
                    },
                });
            });
        });
    }
    getLEDWhiteBalanceGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                rgbButtons: {
                    r: yield this.getLEDWhiteBalance(0),
                    g: yield this.getLEDWhiteBalance(1),
                    b: yield this.getLEDWhiteBalance(2),
                },
                rgbPads: {
                    r: yield this.getLEDWhiteBalance(3),
                    g: yield this.getLEDWhiteBalance(4),
                    b: yield this.getLEDWhiteBalance(5),
                },
                displayButtons: {
                    r: yield this.getLEDWhiteBalance(6),
                    g: yield this.getLEDWhiteBalance(7),
                    b: yield this.getLEDWhiteBalance(8),
                },
                whiteButtons: yield this.getLEDWhiteBalance(9),
                touchStrip: yield this.getLEDWhiteBalance(10),
            };
        });
    }
    getSelectedPadSensitivity(scene, track) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._getParamPromise([0x29, scene, track], (resp, next) => {
                next(resp.bytes[9]);
            });
        });
    }
    getPadSensitivitySettings() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Pass in 0,0 to get all values at once.
            // "By passing 0, 0 as scene and track, the settings for all pads can be selected."
            // return new Promise(async (resolve, reject) => {
            var padSettings = {};
            for (var scene = 1; scene < 9; scene++) {
                padSettings[scene] = {};
                for (var track = 1; track < 9; track++) {
                    var sensitivity = yield this.getSelectedPadSensitivity(scene, track).catch((err) => {
                        console.error(`Unable to set pad sensitivity for scene ${scene}, track ${track}: ${err}`);
                        throw err;
                    });
                    padSettings[scene][track] = SENSITIVITY[sensitivity];
                }
            }
            return padSettings;
            // });
        });
    }
    setPadSensitivitySettings(scene, track, setting) {
        // Command ID 0x28
        // setting: 'normal', 'reduced', or 'low'
        // The purpose is to reduce the sensitivity of pads that should not be triggered "by accident",
        // like a loop selector near drum pads.
        assert(scene >= 1 && scene <= 8, "should be within range 1..8");
        assert(track >= 1 && track <= 8, "should be within range 1..8");
        assert(['normal', 'reduced', 'low'].includes(setting), "should be one of 'normal', 'reduced', or 'low'");
        this._sendSysexCommand([0x28, scene, track, SENSITIVITY[setting]]);
    }
    get400gPadValuesForScene(scene) {
        assert(scene >= 0 && scene <= 8, "'scene' should be a number from 1..8.");
        return this._getParamPromise([0x1D, scene], (resp, next) => {
            var vals = resp.bytes.slice(8, -1);
            var res = {};
            for (var i = 0; i < 8; i++) {
                res[i + 1] = vals[i * 2] | vals[i * 2 + 1] << 7;
            }
            next(res);
        });
    }
    get400gPadValues() {
        return __awaiter(this, void 0, void 0, function* () {
            var res = {};
            for (var i = 0; i < 8; i++) {
                res[i + 1] = yield this.get400gPadValuesForScene(i + 1);
            }
            return res;
        });
    }
    set400gPadValues(scene, values) {
        // scene: scene in range 1..8
        // values: 400g value for each track in scene
        // Temporarily set calibration values for individual pads.
        // The overwritten values are in effect until the device is rebooted.
        // Pad values are in range from 0 to 4095. The 400g reference value is 1690.
        // Higher 400g values are compensated in the firmware by lowering the resulting
        // velocities somewhat, for lower 400g values the velocities are boosted.
        // The 400g values have no effect on the note-on threshold (both in the pad physics
        // and in the algorithm interpreting the read values).
        assert(scene >= 1 && scene <= 8, "should be within range 1..8");
        assert(values.length == 8, "should be an array of length 8");
        var msg = [0x22, scene];
        for (var i = 0; i < 8; i++) {
            assert(values[i] >= 0 && values[i] <= 4095, "All 400g values should be in the range 0..4095");
            msg.push(values[i] & 127);
            msg.push(values[i] >> 7);
        }
        this._sendSysexCommand(msg);
    }
    getPadVelocityCurveEntry(i) {
        // i: index (0..127)
        assert(i >= 0 && i <= 127, "'i' should be in range 0..127");
        return this._getParamPromise([0x21, i], (resp, next) => {
            next(resp.bytes[8]);
        });
    }
    setPadVelocityCurveEntry(i, v) {
        // i: start index (one of 0, 16, 32, 48, 64, 80, 96, 112)
        // v: array of 16 velocities for index i+j, e.g. v[15] is velocity at index i+15
        // velocities are in range 1..127
        assert(i in [0, 16, 32, 48, 64, 80, 96, 112], "'i' should be one of (0, 16, 32, 48, 64, 80, 96, 112)");
        assert(v.length == 16, "v should be an array with 16 velocities");
        for (var j in v) {
            assert(v[j] >= 1 && v[j] <= 127, "velocities should be in range 1..127");
        }
        var cmd = [0x20, i].concat(v);
        this._sendSysexCommand(cmd);
    }
    _getParamPromise(commandId, responseHandler) {
        return new Promise((resolve, reject) => {
            if (typeof commandId == 'number')
                commandId = [commandId];
            return this._sendSysexRequest(commandId).then((resp) => {
                responseHandler(resp, resolve);
            }).catch(reject);
        });
    }
    _sendCommandAndValidate(command) {
        this._sendSysexCommand(command);
        // This relies on the assumption that the command id for 'get'
        // commands is the 'set' commandId +1
        return this._getParamPromise(command[0] + 1, (resp, next) => {
            // resp.bytes.slice(7,-1) should equal command.slice(1)
            var bytesValid = command.slice(1).map((v, i) => v == resp.bytes[i + 7]);
            if (bytesValid.includes(false))
                throw new Error(`Error validating setting. Sent ${command.slice(1)},` +
                    ` but setting is currently ${resp.bytes.slice(7, -1)}.`);
            else
                next();
        });
    }
    _sendSysexCommand(msg) {
        // Adds sysex message header and 0xf7 footer, then sends command.
        //[F0 00 21 1D 01 01 ... ... ... F7];
        var a = [0xf0, 0x00, 0x21, 0x1d, 0x01, 0x01];
        if (typeof msg == 'number')
            msg = [msg];
        msg.forEach((v) => a.push(v));
        a.push(0xf7);
        // console.log("Sending sysex command:",a.map((v)=>{return v.toString(16);}));
        this.midi.send('sysex', a);
    }
    _sendSysexRequest(msg) {
        // Sends a sysex request and handles response. Throws error if no respone received after 1 second.
        return new Promise((resolve, reject) => {
            var commandId = msg[0];
            setTimeout(() => {
                reject(new Error("No usable sysex response message received."));
            }, 1000);
            // TODO: Set up only one listener, use to handle all messages.
            this.midi.setMaxListeners(100);
            this.midi.on('sysex', function handler(resp) {
                if (resp.bytes[6] == commandId) { // This response matches our request.
                    // console.log("Waiting for "+commandId+" Got SYSEX:",resp);
                    this.midi.removeListener('sysex', handler);
                    resolve(resp);
                    // } else {
                    //   console.warn(`Received sysex message, but command id didn't match. Sent: ${msg} and got ${resp.bytes}`);
                }
            }.bind(this));
            this._sendSysexCommand(msg);
        });
    }
    _printMessage(msg) {
        var buttonName;
        if (msg.note) {
            buttonName = push2keymap.keys[msg.note];
        }
        else if (msg.controller) {
            buttonName = push2keymap.controls[msg.controller];
        }
        if (msg._type == 'noteon') {
            var toPrint = ` ${buttonName} pressed`;
            if (msg.note >= 36 && msg.note <= 99)
                toPrint += `, velocity: ${msg.velocity}`;
            console.log(this.portName, toPrint, msg);
        }
        else if (msg._type == 'noteoff')
            console.log(this.portName, ` ${buttonName} released`, msg);
        else if (msg._type == 'poly aftertouch')
            console.log(this.portName, ` ${buttonName} pressure change to: ${msg.pressure}`, msg);
        else if (msg._type == 'cc')
            console.log(this.portName, ` ${buttonName}: ${msg.value}`, msg);
        else if (msg._type == 'program')
            console.log(this.portName, ` program: ${msg.program}`, msg);
        else if (msg._type == 'channel aftertouch')
            console.log(this.portName, ` channel pressure change to: ${msg.pressure}`, msg);
        else if (msg._type == 'pitch')
            console.log(this.portName, ` pitch bend position: ${msg.value}`, msg);
        else if (msg._type == 'position')
            console.log(this.portName, ` control wheel position: ${msg.value}`, msg);
        //else console.log(this.portName,` message not understood: `,msg);
    }
}
exports.Push2 = Push2;
module.exports = Push2;
