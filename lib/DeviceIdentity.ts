import {bit7array2dec, dec2bit7array} from './utils';

export interface DeviceIdentity{
  firmwareVersion:string;
  serialNumber:number;
  softwareBuild:number;
  deviceFamilyCode:number;
  deviceFamilyMemberCode:number;
  boardRevision:number;
}
export class DeviceIdentity {
  constructor(bytes:number[]){
    this.firmwareVersion = bytes[12]+'.'+bytes[13];
    // Parse serial number
    this.serialNumber = bit7array2dec(bytes.slice(16,21));
    // parse build number
    this.softwareBuild = bit7array2dec(bytes.slice(14,16));
    // device family code
    this.deviceFamilyCode = bit7array2dec(bytes.slice(8,10));
    // device family member code
    this.deviceFamilyMemberCode = bit7array2dec(bytes.slice(10,12));
    this.boardRevision = bytes[21];
  }
}
