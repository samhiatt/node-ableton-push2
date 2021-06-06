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
    getDeviceId(): Promise<unknown>;
    getTouchStripConfiguration(): Promise<unknown>;
    setTouchStripConfiguration(val: any): Promise<unknown>;
    setTouchStripLEDs(brightnessArray: any): Promise<unknown>;
    getGlobalLEDBrightness(): Promise<unknown>;
    setGlobalLEDBrightness(val: any): Promise<unknown>;
    setMidiMode(mode: any): Promise<void>;
    getDisplayBrightness(): Promise<unknown>;
    setDisplayBrightness(val: any): Promise<unknown>;
    getLEDColorPaletteEntry(paletteIdx: number): Promise<unknown>;
    setLEDColorPaletteEntry(paletteIdx: number, color: Color, validate: false): Promise<unknown>;
    reapplyColorPalette(): void;
    setAftertouchMode(mode: any): Promise<unknown>;
    getAftertouchMode(): Promise<unknown>;
    getStatistics(): Promise<unknown>;
    getSelectedPadSensitivity(scene: number, track: number): Promise<unknown>;
    getPadSensitivitySettings(): Promise<{}>;
    private _getParamPromise;
    private _sendCommandAndValidate;
    private _sendSysexCommand;
    private _sendSysexRequest;
    private _printMessage;
}
