var easymidi = require('easymidi');

console.log('Input ports: \n\t'+easymidi.getInputs().join('\n\t'));
console.log('Output ports: \n\t'+easymidi.getOutputs().join('\n\t'));

process.exit(0);
