var ableton = require('.');

var push2 = new ableton.Push2('live', false);

// var scene = 1;
// var track = 1;
// push2.getSelectedPadSensitivity(scene,track).then((val)=>{
//     console.log("scene: "+scene.toString()+
//         " track: "+track.toString()+
//         " val: "+val.toString());
// });

// push2.getPadSensitivitySettings().then((resp)=> {
//     console.log(resp);
// }).catch((err)=>{
//     console.error("Error getting settings:"+err.toString());
//     process.exit(1);
// });

push2.get400gPadValues(8).then((resp)=> {
    console.log(resp);
}).catch((err)=>{
    console.error("Error getting 400g pad values:"+err.toString());
    process.exit(1);
});