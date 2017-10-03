var midi = require('midi-stream');
var deepEqual = require('deep-equal');
var VirtualResponder = /** @class */ (function () {
    function VirtualResponder(port) {
        if (port === void 0) { port = 'user'; }
        port = port[0].toUpperCase() + port.toLowerCase().slice(1);
        this.portName = "Virtual Ableton Push 2 " + port + " Port";
        this.midi = midi(this.portName);
        this._aftertouchMode = 0;
        this._touchStripConfiguration = 0;
        this._globalLEDBrightness = 0;
        this._displayBrightness = [0, 0];
        this._midiMode = 1;
    }
    VirtualResponder.prototype.listen = function () {
        var _this = this;
        this.midi.on('data', function (msg) {
            // console.log("Virtual device got ",msg);
            if (deepEqual(msg, [240, 126, 1, 6, 1, 247])) {
                // console.log("Get Identity request received");
                _this.midi.write([240, 126, 1, 6, 2, 0, 33, 29, 103, 50, 2, 0, 1, 0, 60, 0, 58, 31, 37, 8, 0, 1, 247]);
            }
            else if (deepEqual(msg, [240, 0, 33, 29, 1, 1, 24, 247])) {
                // console.log("Get touch strip configuration request received");
                _this.midi.write([240, 0, 33, 29, 1, 1, 24, _this._touchStripConfiguration, 247]);
            }
            else if (deepEqual(msg.slice(0, 7), [240, 0, 33, 29, 1, 1, 23])) {
                // console.log("Get touch strip configuration request received",msg[7]);
                _this._touchStripConfiguration = msg[7];
            }
            else if (deepEqual(msg, [240, 0, 33, 29, 1, 1, 31, 247])) {
                // console.log("Get aftertouch mode request received",msg);
                _this.midi.write([240, 0, 33, 29, 1, 1, 31, _this._aftertouchMode, 247]);
            }
            else if (deepEqual(msg.slice(0, 7), [240, 0, 33, 29, 1, 1, 30])) {
                // console.log("Set aftertouch mode request received:",msg);
                _this._aftertouchMode = msg[7];
            }
            else if (deepEqual(msg, [240, 0, 33, 29, 1, 1, 7, 247])) {
                // console.log("Get global LED brightness request received",msg);
                _this.midi.write([240, 0, 33, 29, 1, 1, 7, _this._globalLEDBrightness, 247]);
            }
            else if (deepEqual(msg.slice(0, 7), [240, 0, 33, 29, 1, 1, 6])) {
                // console.log("Set global LED brightness request received",msg);
                _this._globalLEDBrightness = msg[7];
            }
            else if (deepEqual(msg, [240, 0, 33, 29, 1, 1, 9, 247])) {
                // console.log("Get display brightness request received",this._displayBrightness[0],this._displayBrightness[1]);
                _this.midi.write([240, 0, 33, 29, 1, 1, 9, _this._displayBrightness[0], _this._displayBrightness[1], 247]);
            }
            else if (deepEqual(msg, [240, 0, 33, 29, 1, 1, 26, 1, 247])) {
                // console.log("Get statistics request received");
                _this.midi.write([240, 0, 33, 29, 1, 1, 26, 1, 1, 99, 8, 0, 0, 0, 247]);
            }
            else if (deepEqual(msg, [240, 0, 33, 29, 1, 1, 4, 127, 247])) {
                // console.log("Get LED color palette entry request received",msg);
                _this.midi.write([240, 0, 33, 29, 1, 1, 4, 127, 127, 1, 0, 0, 0, 0, 0, 1, 247]);
            }
            else if (deepEqual(msg.slice(0, 7), [240, 0, 33, 29, 1, 1, 8])) {
                // console.log("Set display brightness request received",msg);
                _this._displayBrightness = [msg[7], msg[8]];
            }
            else if (deepEqual(msg.slice(0, 7), [240, 0, 33, 29, 1, 1, 10])) {
                // console.log("Set MIDI mode request received",msg);
                _this._midiMode = msg[7];
            }
        });
    };
    VirtualResponder.prototype.close = function () {
        this.midi.removeAllListeners();
        this.midi.close();
    };
    return VirtualResponder;
}());
module.exports = VirtualResponder;
