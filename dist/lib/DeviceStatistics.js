"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var DeviceStatistics = /** @class */ (function () {
    function DeviceStatistics(bytes) {
        this.powerStatus = bytes[7] == 0 ? 'USB' : 'External A/C';
        this.runId = bytes[8];
        this.upTime = utils_1.bit7array2dec(bytes.slice(9, 14));
    }
    return DeviceStatistics;
}());
exports.DeviceStatistics = DeviceStatistics;
