"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var easymidi = require('easymidi');
// var EventEmitter = require('events').EventEmitter;
var Enum = require('enum');
var push2keymap = require('./Push2Keymap');
var events_1 = require("events");
var TouchStripConfiguration_1 = require("./TouchStripConfiguration");
var DeviceIdentity_1 = require("./DeviceIdentity");
var DeviceStatistics_1 = require("./DeviceStatistics");
// Make our Enums easily printable
Enum.prototype.toString = function () {
    return this.enums.map(function (k) { return k.key; }).toString();
};
var Midi = /** @class */ (function (_super) {
    __extends(Midi, _super);
    function Midi(portName, virtual) {
        if (portName === void 0) { portName = 'Ableton Push 2 User Port'; }
        if (virtual === void 0) { virtual = false; }
        var _this = _super.call(this) || this;
        // console.log(`Initializing ${portName}`);
        _this._input = new easymidi.Input(portName, virtual);
        _this._output = new easymidi.Output(portName, virtual);
        _this._input.on('message', function (msg) {
            // Emit all messages as 'message' events, plus each individual type separately.
            _this.emit(msg._type, msg);
            _this.emit('message', msg);
        });
        return _this;
    }
    Midi.prototype.send = function (messageType, message) {
        this._output.send(messageType, message);
    };
    Midi.prototype.removeAllListeners = function (event) {
        this._input.removeAllListeners(event);
        return this;
    };
    Midi.prototype.close = function () {
        this._input.close();
        this._output.close();
    };
    return Midi;
}(events_1.EventEmitter));
exports.Midi = Midi;
var midiModes = new Enum({ LIVE: 0, USER: 1, BOTH: 2 }, { ignoreCase: true });
var ports = new Enum({ LIVE: 0, USER: 1 }, { ignoreCase: true });
var aftertouchModes = new Enum({ CHANNEL: 0, POLY: 1 }, { ignoreCase: true });
var Push2 = /** @class */ (function (_super) {
    __extends(Push2, _super);
    // Emits Events: 'device-id' deviceId received
    function Push2(port, virtual) {
        if (port === void 0) { port = 'user'; }
        if (virtual === void 0) { virtual = false; }
        var _this = _super.call(this) || this;
        _this.isVirtual = virtual;
        _this.deviceId = null;
        _this.touchStripConfiguration = null;
        if (!ports.get(port))
            throw new Error("Expected port to be one of: " + ports + ".");
        port = port[0].toUpperCase() + port.toLowerCase().slice(1); // Capitalize the first letter
        _this.portName = (virtual ? 'Virtual ' : '') + "Ableton Push 2 " + port + " Port";
        _this.midi = new Midi(_this.portName, virtual);
        _this.getDeviceId();
        return _this;
        // this.getTouchStripConfiguration();
    }
    Push2.prototype.monitor = function () {
        var portName = this.portName;
        this.midi.on('message', this._printMessage.bind(this));
    };
    Push2.prototype.stopMonitor = function () {
        this.midi.removeListener('message', this._printMessage.bind(this));
    };
    Push2.prototype.close = function () {
        this.midi.close();
    };
    Push2.prototype.setColor = function (key, paletteIdx) {
        // key: key name from push2keymap
        // pad can also be an array containing [track,scene] with values [[1-8],[1-8]]
        // paletteIdx: color palette index [1-127]
        var keyIndex = null;
        var keyName = "";
        //if (typeof key == 'number') keyIndex=key;
        if (typeof key == 'string') {
            keyIndex = push2keymap.controlsByName[key];
            if (keyIndex == null)
                keyIndex = push2keymap.keysByName[key];
            keyName = key;
        }
        else if (typeof key == 'object') {
            keyName = "pad " + key[0] + "," + key[1];
            keyIndex = push2keymap.keysByName[keyName];
        }
        if (keyIndex == null)
            throw keyName + " not found.";
        // console.log(`Setting color of ${keyName} (${keyIndex}) to ${paletteIdx}`);
        if (keyName.slice(0, 4) == "pad ") {
            this.midi.send('noteon', {
                note: keyIndex,
                velocity: paletteIdx,
            });
        }
        else {
            this.midi.send('cc', {
                controller: keyIndex,
                value: paletteIdx,
            });
        }
    };
    Push2.prototype.getDeviceId = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.midi.on('sysex', function handler(msg) {
                if (msg.bytes[4] == 2) {
                    self.midi.removeListener('sysex', handler);
                    self.deviceId = new DeviceIdentity_1.DeviceIdentity(msg.bytes);
                    self.emit('device-id', self.deviceId);
                    resolve(self.deviceId);
                }
            });
            self.midi.send('sysex', [240, 126, 1, 6, 1, 247]);
            setTimeout(function () {
                reject(new Error("No device inquiry reponse received."));
            }, 1000);
        });
    };
    Push2.prototype.getTouchStripConfiguration = function () {
        var _this = this;
        return this._getParamPromise(0x18, function (resp, resolve) {
            _this.touchStripConfiguration = new TouchStripConfiguration_1.TouchStripConfiguration(resp.bytes[7]);
            _this.emit('received_touchStripConfiguration', _this.touchStripConfiguration);
            resolve(_this.touchStripConfiguration);
        });
    };
    Push2.prototype.setTouchStripConfiguration = function (val) {
        var _this = this;
        // If val is undefined will reset touch strip configuration to default.
        return new Promise(function (resolve, reject) {
            var sendCommand = function (encoded) {
                var conf = new TouchStripConfiguration_1.TouchStripConfiguration(encoded);
                _this._sendSysexCommand([0x17, conf.getByteCode()]);
                _this.getTouchStripConfiguration().then(function (currentConf) {
                    Object.keys(_this.touchStripConfiguration).forEach(function (prop) {
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
                return _this.getTouchStripConfiguration().then(function (conf) {
                    Object.keys(_this.touchStripConfiguration).forEach(function (key) {
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
    };
    Push2.prototype.setTouchStripLEDs = function (brightnessArray) {
        var _this = this;
        // Uses sysex message to set LEDs.
        // brightnessArray should be an array of 31 brightness values from 0-7 where
        // brightnessArray[0] is the bottom LED, brightnessArray[30] is the top LED.
        if (brightnessArray.length != 31)
            throw new Error("Expected brightnessArray of length 31");
        return new Promise(function (resolve, reject) {
            var bytes = [0x19];
            for (var i = 0; i < 16; i++) {
                bytes.push(((i != 15) ? (brightnessArray[i * 2 + 1]) << 3 : 0) | (brightnessArray[i * 2]));
            }
            // Lets make sure the set 'LEDsControlledByHost' and 'hostSendsSysex' to enable control.
            return _this.setTouchStripConfiguration({ 'LEDsControlledByHost': 1, 'hostSendsSysex': 1 }).then(function (conf) {
                // No need to wait for response since there is no "getTouchStripLEDs" command
                _this._sendSysexCommand(bytes);
                resolve();
            }).catch(reject);
        });
    };
    Push2.prototype.getGlobalLEDBrightness = function () {
        return this._getParamPromise(0x07, function (resp, next) {
            next(resp.bytes[7]);
        });
    };
    Push2.prototype.setGlobalLEDBrightness = function (val) {
        var bytes = [0x06];
        bytes.push(val);
        return this._sendCommandAndValidate(bytes).catch(function (err) {
            throw new Error("Tried setting global LED brightness, but new value doesn't match. " + err);
        });
        // return this._sendSysexCommand(bytes);
    };
    Push2.prototype.setMidiMode = function (mode) {
        if (!midiModes.isDefined(mode))
            throw new Error("Expected mode to be one of: " + midiModes + ".");
        this._sendSysexRequest([0x0a, midiModes.get(mode)]).then(function (resp) {
            if (resp.bytes[7] != midiModes.get(mode))
                throw new Error("Tried to set MIDI mode to ${mode} but responded with " +
                    "mode ${midiModes.get(resp.bytes[7])}");
        });
    };
    Push2.prototype.getDisplayBrightness = function () {
        return this._getParamPromise(0x09, function (resp, next) {
            next(resp.bytes[7] | resp.bytes[8] << 7);
        });
    };
    Push2.prototype.setDisplayBrightness = function (val) {
        var req = [0x08, val & 127, val >> 7];
        return this._sendCommandAndValidate(req).catch(function (err) {
            throw new Error("Tried setting display brightness, but new value doesn't match. " + err);
        });
        // this._sendSysexCommand(req);
    };
    Push2.prototype.getLEDColorPaletteEntry = function (paletteIdx) {
        var decode = function (lower7bits, higher1bit) {
            return lower7bits | higher1bit << 7;
        };
        return this._getParamPromise([0x04, paletteIdx], function (resp, next) {
            next({
                r: decode(resp.bytes[8], resp.bytes[9]),
                g: decode(resp.bytes[10], resp.bytes[11]),
                b: decode(resp.bytes[12], resp.bytes[13]),
                a: decode(resp.bytes[12], resp.bytes[13]),
            });
        });
    };
    Push2.prototype.reapplyColorPalette = function () {
        // trigger palette reapplication
        this._sendSysexCommand(0x05);
    };
    Push2.prototype.setAftertouchMode = function (mode) {
        // mode = mode.toLowerCase();
        if (!aftertouchModes.get(mode))
            throw new Error("Expected mode to be one of " + aftertouchModes + ".");
        return this._sendCommandAndValidate([0x1e, aftertouchModes.get(mode)]);
    };
    Push2.prototype.getAftertouchMode = function () {
        return this._getParamPromise([0x1f], function (resp, next) {
            next(resp.bytes[7] == 0 ? 'channel' : 'poly');
        });
    };
    Push2.prototype.getStatistics = function () {
        return this._getParamPromise([0x1a, 0x01], function (resp, next) {
            next(new DeviceStatistics_1.DeviceStatistics(resp.bytes));
        });
    };
    Push2.prototype._getParamPromise = function (commandId, responseHandler) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof commandId == 'number')
                commandId = [commandId];
            return _this._sendSysexRequest(commandId).then(function (resp) {
                responseHandler(resp, resolve);
            }).catch(reject);
        });
    };
    Push2.prototype._sendCommandAndValidate = function (command) {
        this._sendSysexCommand(command);
        // This relies on the assumption that the command id for 'get'
        // commands is the 'set' commandId +1
        return this._getParamPromise(command[0] + 1, function (resp, next) {
            // resp.bytes.slice(7,-1) should equal command.slice(1)
            var bytesValid = command.slice(1).map(function (v, i) { return v == resp.bytes[i + 7]; });
            if (bytesValid.includes(false))
                throw new Error("Error validating setting. Sent " + command.slice(1) + "," +
                    (" but setting is currently " + resp.bytes.slice(7, -1) + "."));
            else
                next();
        });
    };
    Push2.prototype._sendSysexCommand = function (msg) {
        // Adds sysex message header and 0xf7 footer, then sends command.
        //[F0 00 21 1D 01 01 ... ... ... F7];
        var a = [0xf0, 0x00, 0x21, 0x1d, 0x01, 0x01];
        if (typeof msg == 'number')
            msg = [msg];
        msg.forEach(function (v) { return a.push(v); });
        a.push(0xf7);
        // console.log("Sending sysex command:",a);
        this.midi.send('sysex', a);
    };
    Push2.prototype._sendSysexRequest = function (msg) {
        var _this = this;
        // Sends a sysex request and handles response. Throws error if no respone received after 1 second.
        return new Promise(function (resolve, reject) {
            var commandId = msg[0];
            setTimeout(function () {
                reject(new Error("No usable sysex reponse message received."));
            }, 1000);
            _this.midi.setMaxListeners(100);
            _this.midi.on('sysex', function handler(resp) {
                if (resp.bytes[6] == commandId) {
                    this.midi.removeListener('sysex', handler);
                    resolve(resp);
                    // } else {
                    //   console.warn(`Received sysex message, but command id didn't match. Sent: ${msg} and got ${resp.bytes}`);
                }
            }.bind(_this));
            _this._sendSysexCommand(msg);
        });
    };
    Push2.prototype._printMessage = function (msg) {
        var buttonName;
        if (msg.note) {
            buttonName = push2keymap.keys[msg.note];
        }
        else if (msg.controller) {
            buttonName = push2keymap.controls[msg.controller];
        }
        if (msg._type == 'noteon') {
            var toPrint = " " + buttonName + " pressed";
            if (msg.note >= 36 && msg.note <= 99)
                toPrint += ", velocity: " + msg.velocity;
            console.log(this.portName, toPrint, msg);
        }
        else if (msg._type == 'noteoff')
            console.log(this.portName, " " + buttonName + " released", msg);
        else if (msg._type == 'poly aftertouch')
            console.log(this.portName, " " + buttonName + " pressure change to: " + msg.pressure, msg);
        else if (msg._type == 'cc')
            console.log(this.portName, " " + buttonName + ": " + msg.value, msg);
        else if (msg._type == 'program')
            console.log(this.portName, " program: " + msg.program, msg);
        else if (msg._type == 'channel aftertouch')
            console.log(this.portName, " channel pressure change to: " + msg.pressure, msg);
        else if (msg._type == 'pitch')
            console.log(this.portName, " pitch bend position: " + msg.value, msg);
        else if (msg._type == 'position')
            console.log(this.portName, " control wheel position: " + msg.value, msg);
        else
            console.log(this.portName, " message not understood: ", msg);
    };
    return Push2;
}(events_1.EventEmitter));
exports.Push2 = Push2;
module.exports = Push2;
