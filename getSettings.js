var ableton = require('.');
var push2 = new ableton.Push2('live', false);

(async function() {
    console.log("Device ID:", await push2.getDeviceId());
    console.log("Pad 400g Values:", JSON.stringify(await push2.get400gPadValues()));
    console.log("Pad Sensitivity:", await push2.getPadSensitivitySettings());
    console.log("White Balance Groups:", await push2.getLEDWhiteBalanceGroups());
    console.log("Pedal Data:", await push2.samplePedalData(9));
    push2.setPadSensitivitySettings(8,1, 'low');
})().then(()=>{
    process.exit(0);
}).catch((err)=>{
    console.error(err);
    process.exit(1);
});