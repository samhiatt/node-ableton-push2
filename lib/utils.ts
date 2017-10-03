/**
* Decodes an array of 7-bit values ordered from LSB to MSB.
*/
export function bit7array2dec(bit7array:number[]):number {
  var dec = 0;
  bit7array.forEach((v,i)=> dec |= v << (i*7) );
  return dec;
}
/**
* Encodes a number as an array of 7-bit numbers from LSB to MSB.
*/
export function dec2bit7array(num:number):number[]{
  if (num < 0 || typeof num != 'number') throw new Error("Only positive numbers supported.");
  var p =  Math.floor(num.toString(2).length/7);
  var res:number[] = [];
  while (p>=0){
    res.push((num >> p*7)&0x7f);
    p -= 1;
  }
  return res.reverse();
}
