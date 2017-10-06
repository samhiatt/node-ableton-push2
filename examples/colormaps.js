var ableton = require('../');
var colormap = require('colormap');

var push2 = new ableton.Push2();

push2.setMidiMode('user');  // Make sure we're in user mode
push2.setLEDColorPaletteEntry(0,{r:0,g:0,b:0,a:0});  // Reserve idx 0 as 'off'
push2.reapplyColorPalette();

// Light up octave up/down buttons
push2.setColor('octave up',127);  // octave up to select colorList[pointer-1]
push2.setColor('octave down',127); // octave up to select colorList[pointer-1]

var colorList = ['jet', 'hsv', 'hot', 'cool', 'spring', 'summer', 'autumn', 'winter', 'bone', 'copper', 'greys', 'greens', 'bluered', 'RdBu', 'picnic', 'rainbow', 'portland', 'blackbody', 'earth', 'electric', 'viridis', 'inferno', 'magma', 'plasma', 'warm', 'cool', 'rainbow-soft', 'bathymetry', 'cdom', 'chlorophyll', 'density', 'freesurface-blue', 'freesurface-red', 'oxygen', 'par', 'phase', 'salinity', 'temperature', 'velocity-blue', 'velocity-green', 'cubehelix'];
var pointer = 0;

// Set each pad to one of the colors
for(let scene=1; scene<=8; scene++){
  for(let track=1; track<=8; track++){
    let colorIdx = ((track+(scene-1)*8)*2)-1;
    push2.setColor([track,scene],colorIdx);
  }
}

function setPalette(paletteIdx){
  let colors = colormap({
    colormap:colorList[paletteIdx],
    nshades: 127,
    format: 'warm',
    alpha:1,
  });
  console.log("Setting colormap to '"+colorList[paletteIdx]+"'");
  for (let i=0;i<127;i++){
    // Note that the alpha value is set to 255 for idx 1-127. The alpha value is used by buttons with white LEDs.
    push2.setLEDColorPaletteEntry(i+1,{r:colors[i][0],g:colors[i][1],b:colors[i][2],a:255});
  }

}
setPalette(0);

/**
* On 'page up' or 'page down' change colormap.
* TODO: Implement and use custom Push2 event names.
*/
push2.midi.on('cc',(msg)=>{
  console.log(msg);
  if (msg.value==0&&(msg.controller==55||msg.controller==54)){ // page up/down released
    pointer = (msg.controller==54)? pointer+1 : pointer-1; // page up or page down
    if (pointer>colorList.length-1) pointer = 0;   // wrap around if out of index
    if (pointer<0) pointer = colorList.length-1;
    setPalette(pointer);
  }
});


process.on('SIGINT',()=>{
 console.log("Exiting.");
 // Turn of pad lights.
 for(let scene=1; scene<=8; scene++){
   for(let track=1; track<=8; track++){
     push2.setColor([track,scene],0);
   }
 }
 push2.setColor('octave up',0);
 push2.setColor('octave down',0);
 process.exit(0);
});
