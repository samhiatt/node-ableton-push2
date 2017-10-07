export interface TouchStripConfiguration {
    LEDsControlledByHost: boolean;
    hostSendsSysex: boolean;
    valuesSentAsModWheel: boolean;
    LEDsShowPoint: boolean;
    barStartsAtCenter: boolean;
    doAutoReturn: boolean;
    autoReturnToCenter: boolean;
}
export declare class TouchStripConfiguration {
    constructor(val: number | TouchStripConfiguration);
    getByteCode(): number;
    private _parseNum(num);
}
