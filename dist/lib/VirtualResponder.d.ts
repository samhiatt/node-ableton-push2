declare var midi: any;
declare var deepEqual: any;
interface VirtualResponder {
    portName: string;
    midi: any;
    _aftertouchMode: number;
    _touchStripConfiguration: number;
    _globalLEDBrightness: number;
    _displayBrightness: [number];
    _midiMode: number;
}
declare class VirtualResponder {
    constructor(port?: string);
    listen(): void;
    close(): void;
}
