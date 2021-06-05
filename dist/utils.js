"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dec2bit7array = exports.bit7array2dec = void 0;
/**
* Decodes an array of 7-bit values ordered from LSB to MSB.
*/
function bit7array2dec(bit7array) {
    var dec = 0;
    bit7array.forEach((v, i) => dec |= v << (i * 7));
    return dec;
}
exports.bit7array2dec = bit7array2dec;
/**
* Encodes a number as an array of 7-bit numbers from LSB to MSB.
*/
function dec2bit7array(num) {
    if (num < 0 || typeof num != 'number')
        throw new Error("Only positive numbers supported.");
    var p = Math.floor(num.toString(2).length / 7);
    var res = [];
    while (p >= 0) {
        res.push((num >> p * 7) & 0x7f);
        p -= 1;
    }
    return res.reverse();
}
exports.dec2bit7array = dec2bit7array;
