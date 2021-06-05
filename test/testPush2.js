var ableton = require('../dist');
var expect = require('chai').expect;
var VirtualResponder = require('../dist/VirtualResponder');

describe('Push2',()=>{
  describe('constructor',()=>{
    it("should throw an error if instantiated with anything other than 'live' or 'user'.",()=>{
      function badInstantiation(){
        new ableton.Push2('foobar');
      }
      expect(badInstantiation).to.throw(/Expected port to be/i);
    });
    it("should instantiate a virtual Push2 instance, when called with port='user'.",()=>{
      function closeIt(){push.close();}
      var push = new ableton.Push2('user',true);
      expect(push).to.have.property('isVirtual',true);
      expect(closeIt).to.not.throw();
    });
  });
  describe('class methods',()=>{
    var push2 = null;
    var isVirtual;
    before(()=>{
      function getVirtualPush(){
        var push2 = new ableton.Push2('user',true);
        var responder = new VirtualResponder('user');
        responder.listen();
        return push2;
      }
      if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase()=='test') {
        console.log("NODE_ENV set to 'test'. Running tests against VirtualResponder.");
        push2 = getVirtualPush();
      }
      if (!push2) try { // Try first connecting to actual Push 2
        push2 = new ableton.Push2('user');
        console.log("Running tests against connected Push 2.");
      } catch(e) {
        if (e.message.startsWith('No MIDI input found')) {
          console.log("No Ableton Push 2 found. Running tests against VirtualResponder.");
          push2 = getVirtualPush();
        }
      }
    });
    describe('getDeviceId',()=>{
      it('should get device identity response',()=>{
        return push2.getDeviceId().then((resp)=>{
          expect(resp).to.have.property('firmwareVersion','1.0');
          expect(resp).to.have.property('softwareBuild',60);
          expect(resp).to.have.property('boardRevision',1);
          if (isVirtual) expect(resp).to.have.property('serialNumber',17387450);
          else expect(resp).to.have.property('serialNumber');
          expect(resp).to.have.property('deviceFamilyCode',6503);
          expect(resp).to.have.property('deviceFamilyMemberCode', 2);
        });
      });
    });
    describe('setAftertouchMode',()=>{
      it('should set aftertouch mode to "poly".',()=>{
        return push2.setAftertouchMode('poly');
      });
      it('should throw an error if called with someting other than "poly" or "channel".',()=>{
        function doIt(){
          push2.setAftertouchMode('foobar');
        }
        expect(doIt).to.throw(/Expected mode to be one of/i);
      });
    });
    describe('getAftertouchMode',()=>{
      it('should get aftertouch mode, should be "poly" or "channel".',()=>{
        return push2.getAftertouchMode().then((mode)=>{
          expect(mode).to.be.a('string');
          // expect(mode).to.be.oneOf(['poly','channel']);
          expect(mode).to.be.equal('poly');
        });
      });
    });
    var origSetting=null;
    describe('getTouchStripConfiguration/setTouchStripConfiguration',()=>{
      it('should get current touch strip config and save it',()=>{
        return push2.getTouchStripConfiguration().then((conf)=>{
          origSetting = conf.getByteCode();
        });
      });
      it('should set touch strip configuration to all 0s',()=>{
        return push2.setTouchStripConfiguration(0).then((conf)=>{
          expect(conf).to.have.property('LEDsControlledByHost',false);
          expect(conf).to.have.property('hostSendsSysex',false);
          expect(conf).to.have.property('valuesSentAsModWheel',false);
          expect(conf).to.have.property('LEDsShowPoint',false);
          expect(conf).to.have.property('barStartsAtCenter',false);
          expect(conf).to.have.property('doAutoReturn',false);
          expect(conf).to.have.property('autoReturnToCenter',false);
        });
      });
      it('should turn on "LEDsControlledByHost"',()=>{
        return push2.setTouchStripConfiguration({'LEDsControlledByHost':true}).then((conf)=>{
          expect(conf).to.have.property('LEDsControlledByHost',true);
          expect(conf).to.have.property('hostSendsSysex',false);
          expect(conf).to.have.property('valuesSentAsModWheel',false);
          expect(conf).to.have.property('LEDsShowPoint',false);
          expect(conf).to.have.property('barStartsAtCenter',false);
          expect(conf).to.have.property('doAutoReturn',false);
          expect(conf).to.have.property('autoReturnToCenter',false);
        });
      });
      it('should set back touchStripConfiguration back to original setting',()=>{
        return push2.setTouchStripConfiguration(origSetting);
      });
      it('should verify original setting',()=>{
        return push2.getTouchStripConfiguration().then((conf)=>{
          expect(conf.getByteCode()).to.equal(origSetting);
        });
      });
    });
    describe('getGlobalLEDBrightness/setGlobalLEDBrightness',()=>{
      it('should get display brightness, set it to 37, '+
          'validate, then set it back to original value', ()=>{
        var origVal = null;
        return push2.getGlobalLEDBrightness().then((val)=>{
            expect(val).to.be.a('number');
            origVal = val;
            return this;
          }).then(()=>{
            return push2.setGlobalLEDBrightness(37);
          }).then(()=>{
            return push2.getGlobalLEDBrightness();
          }).then((newVal)=>{
            expect(newVal).to.equal(37);
            return push2.setGlobalLEDBrightness(origVal);
          });
      });
    });
    describe('getDisplayBrightness/setDisplayBrightness',()=>{
      it('should get display brightness, set it to 137, '+
          'validate, then set it back to original value', ()=>{
        var origVal = null;
        return push2.getDisplayBrightness().then((val)=>{
            expect(val).to.be.a('number');
            origVal = val;
            return this;
          }).then(()=>{
            return push2.setDisplayBrightness(137);
          }).then(()=>{
            return push2.getDisplayBrightness();
          }).then((newVal)=>{
            expect(newVal).to.equal(137);
            return push2.setDisplayBrightness(origVal);
          });
      });
    });
    describe('setMidiMode',()=>{
      it('should set midi mode to "user".',()=>{
        return push2.setMidiMode('user');
      });
      // it('should throw an error if called with "foobar".',()=>{
      //   function doIt(){
      //     return push2.setMidiMode('foobar');
      //   }
      //   expect(doIt).to.throw(/Expected mode to be/i);
      // });
    });
    // describe('reapplyColorPalette',()=>{
    //   it('should send reapply color palette command.',()=>{
    //     return push2.reapplyColorPalette();
    //   });
    // });
    describe('getStatistics',()=>{
      it('should get device statistics.',()=>{
        return push2.getStatistics().then((resp)=>{
          expect(resp).to.have.property('powerStatus');
          expect(resp).to.have.property('runId',1);
        });
      });
    });
    describe('getLEDColorPaletteEntry',()=>{
      var origColor=null;
      it('should get color palette entry for color idx 127 (red).',()=>{
        return push2.getLEDColorPaletteEntry(127).then((resp)=>{
          origColor = resp;
          expect(resp).to.have.property('r');
          expect(resp).to.have.property('g');
          expect(resp).to.have.property('b');
          expect(resp).to.have.property('a');
        });
      });
      it ("should set the color to green",()=>{
        push2.setLEDColorPaletteEntry(127,{r:0,g:255,b:0,a:127}); //,true).then((color)=>{
        return push2.getLEDColorPaletteEntry(127).then((resp)=>{
          expect(resp).to.have.property('r',0);
          expect(resp).to.have.property('g',255);
          expect(resp).to.have.property('b',0);
          expect(resp).to.have.property('a',127);
        });
      });
      it ("should set the color to back to original value",()=>{
        return push2.setLEDColorPaletteEntry(127,origColor);//,true).then((resp)=>{
        //   expect(resp).to.have.property('r');
        // });
      });
      it ("should verify the original value",()=>{
        return push2.getLEDColorPaletteEntry(127).then((resp)=>{
          expect(resp).to.deep.equal(origColor);
        });
      });
    });
  });
});
