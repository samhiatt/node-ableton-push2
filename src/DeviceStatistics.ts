
import {bit7array2dec} from './utils';

export interface DeviceStatistics{
  powerStatus:string; // 'USB' or 'External A/C'
  runId:number;
  upTime:number;
}
export class DeviceStatistics{
  constructor(bytes:number[]){
    this.powerStatus = bytes[7]==0?'USB':'External A/C';
    this.runId = bytes[8];
    this.upTime = bit7array2dec(bytes.slice(9,14));
  }
}
