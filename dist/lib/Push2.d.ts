/// <reference types="node" />
import { EventEmitter } from 'events';
import { TouchStripConfiguration } from './TouchStripConfiguration';
import { DeviceIdentity } from './DeviceIdentity';
export interface Midi {
    _input: any;
    _output: any;
}
export declare class Midi extends EventEmitter {
    constructor(portName?: string, virtual?: boolean);
    send(messageType: any, message: any): void;
    removeAllListeners(event?: string | symbol): this;
    close(): void;
}
export interface Push2 {
    isVirtual: boolean;
    deviceId: DeviceIdentity;
    touchStripConfiguration: TouchStripConfiguration;
    portName: string;
    midi: Midi;
}
export declare class Push2 extends EventEmitter {
    constructor(port?: string, virtual?: boolean);
    monitor(): void;
    stopMonitor(): void;
    close(): void;
    setColor(key: any, paletteIdx: any): void;
    getDeviceId(): Promise<{}>;
    getTouchStripConfiguration(): Promise<{}>;
    setTouchStripConfiguration(val: any): Promise<{}>;
    setTouchStripLEDs(brightnessArray: any): Promise<{}>;
    getGlobalLEDBrightness(): Promise<{}>;
    setGlobalLEDBrightness(val: any): Promise<{}>;
    setMidiMode(mode: any): void;
    getDisplayBrightness(): Promise<{}>;
    setDisplayBrightness(val: any): Promise<{}>;
    getLEDColorPaletteEntry(paletteIdx: any): Promise<{}>;
    reapplyColorPalette(): void;
    setAftertouchMode(mode: any): Promise<{}>;
    getAftertouchMode(): Promise<{}>;
    getStatistics(): Promise<{}>;
    private _getParamPromise(commandId, responseHandler);
    private _sendCommandAndValidate(command);
    private _sendSysexCommand(msg);
    private _sendSysexRequest(msg);
    private _printMessage(msg);
}
