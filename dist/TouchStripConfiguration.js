"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#210-touch-strip
// var _touchStripConfigurationProperties=[
//   'LEDsControlledByHost',   // default: false, controlled by push
//   'hostSendsSysex',         // default: false, host sends values
//   'valuesSentAsModWheel',   // default: false, values sent as pitch bend
//   'LEDsShowPoint',          // default: true, otherwise show a bar
//   'barStartsAtCenter',      // default: false, starts at center
//   'doAutoReturn',           // default: true
//   'autoReturnToCenter',     // default: true, otherwise autoreturns to bottom
// ];
class TouchStripConfiguration {
    constructor(val) {
        // can be instantiated with either a 7-bit valber to be decoded, or
        // val can be an object with options to be merged with defaults.
        if (typeof val == 'number')
            this._parseNum(val);
        else {
            this.LEDsControlledByHost = false;
            this.hostSendsSysex = false;
            this.valuesSentAsModWheel = false;
            this.LEDsShowPoint = true;
            this.barStartsAtCenter = false;
            this.doAutoReturn = true;
            this.autoReturnToCenter = true;
        }
    }
    getByteCode() {
        var res = 0;
        res |= this.LEDsControlledByHost ? 1 : 0;
        res |= this.hostSendsSysex ? 1 : 0 << 1;
        res |= this.valuesSentAsModWheel ? 1 : 0 << 2;
        res |= this.LEDsShowPoint ? 1 : 0 << 3;
        res |= this.barStartsAtCenter ? 1 : 0 << 4;
        res |= this.doAutoReturn ? 1 : 0 << 5;
        res |= this.autoReturnToCenter ? 1 : 0 << 6;
        return res;
    }
    _parseNum(num) {
        this.autoReturnToCenter = ((num >> 6) % 2) ? true : false;
        this.doAutoReturn = ((num >> 5) % 2) ? true : false;
        this.barStartsAtCenter = ((num >> 4) % 2) ? true : false;
        this.LEDsShowPoint = ((num >> 3) % 2) ? true : false;
        this.valuesSentAsModWheel = ((num >> 2) % 2) ? true : false;
        this.hostSendsSysex = ((num >> 1) % 2) ? true : false;
        this.LEDsControlledByHost = ((num) % 2) ? true : false;
    }
}
exports.TouchStripConfiguration = TouchStripConfiguration;
