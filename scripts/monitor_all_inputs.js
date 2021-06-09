let easymidi = require('easymidi');

// Monitor all MIDI inputs with a single "message" listener
easymidi.getInputs().forEach(function(inputName){
  let input = new easymidi.Input(inputName);
  input.on('message', function (msg) {
    let vals = Object.keys(msg).map(function(key){return key+": "+msg[key];});
    console.log(inputName+": "+vals.join(', '));
  });
});
