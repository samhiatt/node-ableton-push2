"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceStatistics = void 0;
const utils_1 = require("./utils");
class DeviceStatistics {
    constructor(bytes) {
        this.powerStatus = bytes[7] == 0 ? 'USB' : 'External A/C';
        this.runId = bytes[8];
        this.upTime = utils_1.bit7array2dec(bytes.slice(9, 14));
    }
}
exports.DeviceStatistics = DeviceStatistics;
//# sourceMappingURL=DeviceStatistics.js.map