export interface DeviceIdentity {
    firmwareVersion: string;
    serialNumber: number;
    softwareBuild: number;
    deviceFamilyCode: number;
    deviceFamilyMemberCode: number;
    boardRevision: number;
}
export declare class DeviceIdentity {
    constructor(bytes: number[]);
}
