/// <reference types="node" />
import { EventEmitter } from 'events';
import { TouchStripConfiguration } from './TouchStripConfiguration';
import { DeviceIdentity } from './DeviceIdentity';
export interface Midi {
    _input: any;
    _output: any;
}
/**
* Access to MIDI events through [easymidi](https://github.com/dinchak/node-easymidi) interface.
*/
export declare class Midi extends EventEmitter {
    constructor(portName?: string, virtual?: boolean);
    /**
    * Send a midi message.
    * See [midi documentation](doc/midi.md#midi-message-event-types) for message types.
    */
    send(messageType: string, message: {
        [t: string]: number;
    } | number[]): void;
    removeAllListeners(event?: string | symbol): this;
    /**
    * Remove event listeners and close ports.
    */
    close(): void;
}
export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface Push2 {
    isVirtual: boolean;
    deviceId: DeviceIdentity;
    touchStripConfiguration: TouchStripConfiguration;
    portName: string;
    midi: Midi;
}
export interface Scene8track {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
}
export interface Grid8x8 {
    1: Scene8track;
    2: Scene8track;
    3: Scene8track;
    4: Scene8track;
    5: Scene8track;
    6: Scene8track;
    7: Scene8track;
    8: Scene8track;
}
export interface RGB {
    r: number;
    g: number;
    b: number;
}
export interface PedalSampleData {
    right: {
        ring: number;
        tip: number;
    };
    left: {
        ring: number;
        tip: number;
    };
}
export interface WhiteBalanceGroups {
    rgbButtons: RGB;
    rgbPads: RGB;
    displayButtons: RGB;
    whiteButtons: number;
    touchStrip: number;
}
export declare enum SENSITIVITY {
    regular = 0,
    reduced = 1,
    low = 1
}
export declare enum MIDIMODES {
    live = 0,
    user = 1,
    both = 2
}
export declare enum PORTS {
    live = 0,
    user = 1
}
export declare enum AFTERTOUCHMODES {
    channel = 0,
    poly = 1
}
/**
* ## Push2 Controller Object
* Opens a connection to a physical, connected Push 2 device, or alternatively a virtual port.
* Implements the functions described in the [Ableton Push 2 MIDI And Display Interface Manual](
*  https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc).
* #### Quick start:
* ```javascript
* var ableton = require('ableton-push2');
* var push2 = new ableton.Push2(port='user'); // Boom! A New Ableton Push 2!!
* push2.setColor([2,3],30); 		 // Set track 2, scene 3 to color index 30
* ```
*/
export declare class Push2 extends EventEmitter {
    /**
    * @param port 'user' or 'live'
    * @param virtual Opens a virtual software port
    */
    constructor(port?: string, virtual?: boolean);
    monitor(): void;
    stopMonitor(): void;
    close(): void;
    setColor(key: any, paletteIdx: any): void;
    getDeviceId(): Promise<DeviceIdentity>;
    getTouchStripConfiguration(): Promise<TouchStripConfiguration>;
    setTouchStripConfiguration(val: any): Promise<TouchStripConfiguration>;
    setTouchStripLEDs(brightnessArray: any): Promise<null>;
    getGlobalLEDBrightness(): Promise<number>;
    setGlobalLEDBrightness(val: any): Promise<void>;
    setMidiMode(mode: any): Promise<void>;
    getDisplayBrightness(): Promise<number>;
    setDisplayBrightness(val: any): Promise<void>;
    getLEDColorPaletteEntry(paletteIdx: number): Promise<{
        r: number;
        g: number;
        b: number;
        a: number;
    }>;
    setLEDColorPaletteEntry(paletteIdx: number, color: Color, validate: false): Promise<void> | void;
    reapplyColorPalette(): void;
    setAftertouchMode(mode: any): void;
    getAftertouchMode(): Promise<string>;
    getStatistics(): Promise<number[]>;
    setAftertouchThresholds(lowerThreshold: number, upperThreshold: number): void;
    getLEDWhiteBalance(colorGroup: number): Promise<number>;
    samplePedalData(n: number): Promise<PedalSampleData>;
    getLEDWhiteBalanceGroups(): Promise<WhiteBalanceGroups>;
    getSelectedPadSensitivity(scene: number, track: number): Promise<number>;
    getPadSensitivitySettings(): Promise<{}>;
    get400gPadValuesForScene(scene: number): Promise<Scene8track>;
    get400gPadValues(): Promise<Grid8x8>;
    setPadVelocityCurveEntry(i: number, v: number[]): void;
    private _getParamPromise;
    private _sendCommandAndValidate;
    private _sendSysexCommand;
    private _sendSysexRequest;
    private _printMessage;
}
