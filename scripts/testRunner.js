// Test runner to enable debugging mocha tests

// Snippet from https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically

let Mocha = require('mocha'),
  fs = require('fs'),
  path = require('path');

let mocha = new Mocha();
let testDir = 'test';

fs.readdirSync(testDir).filter(function(file){
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function(file){
    mocha.addFile(
        path.join(testDir, file)
    );
});
mocha.run(function(failures){
  process.exit(failures);  // exit with non-zero status if there were failures
});
