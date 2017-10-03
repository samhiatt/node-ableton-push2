export interface DeviceStatistics {
    powerStatus: string;
    runId: number;
    upTime: number;
}
export declare class DeviceStatistics {
    constructor(bytes: number[]);
}
