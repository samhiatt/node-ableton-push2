var ableton = require('../');
var expect = require('chai').expect;

describe('Push2',()=>{
  var push2 = null;
  var isVirtual;
  try { // Try first connecting to actual Push 2
    push2 = new ableton.Push2('user');
    console.log("Running tests against connected Push 2.");
  } catch(e) {
    if (e.message.startsWith('No MIDI input found')) {
      console.log("No Ableton Push 2 found. Running tests against VirtualResponder.");
      push2 = new ableton.Push2('user',virtual=true);
      var responder = new ableton.VirtualResponder('user');
      responder.listen();
    }
  }
  describe('getDeviceInfo',()=>{
    it('should get device identity response',()=>{
      return push2.getDeviceInfo().then((resp)=>{
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
  describe('getTouchStripConfiguration/setTouchStripConfiguration',()=>{
    it('should set touch strip configuration to all 0s',()=>{
      return push2.setTouchStripConfiguration(0).then(()=>{
        push2.getTouchStripConfiguration().then((conf)=>{
          expect(conf).to.have.property('LEDsControlledByHost',0);
          expect(conf).to.have.property('hostSendsSysex',0);
          expect(conf).to.have.property('valuesSentAsModWheel',0);
          expect(conf).to.have.property('LEDsShowPoint',0);
          expect(conf).to.have.property('barStartsAtCenter',0);
          expect(conf).to.have.property('doAutoReturn',0);
          expect(conf).to.have.property('autoReturnToCenter',0);
        });
      });
    });
  });
  describe('setTouchStripConfiguration to default',()=>{
    it('should set touch strip to default (104) then get and validate.',()=>{
      return push2.setTouchStripConfiguration(104).then(()=>{
        push2.getTouchStripConfiguration().then((conf)=>{
          expect(conf).to.have.property('LEDsControlledByHost',0);
          expect(conf).to.have.property('hostSendsSysex',0);
          expect(conf).to.have.property('valuesSentAsModWheel',0);
          expect(conf).to.have.property('LEDsShowPoint',1);
          expect(conf).to.have.property('barStartsAtCenter',0);
          expect(conf).to.have.property('doAutoReturn',1);
          expect(conf).to.have.property('autoReturnToCenter',1);
        });
      });
    });
  });
  describe('getGlobalLEDBrightness/setGlobalLEDBrightness',()=>{
    it('should get global LED brightness, set it to 137, '+
        'validate, then set it back to original value', ()=>{
      var origVal = null;
      return push2.getGlobalLEDBrightness().then((val)=>{
          expect(val).to.be.a('number');
          origVal = val;
          return this;
        }).then(()=>{
          return push2.setGlobalLEDBrightness(137);
        }).then(()=>{
          return push2.getGlobalLEDBrightness();
        }).then((newVal)=>{
          expect(newVal).to.equal(137);
          return push2.setGlobalLEDBrightness(origVal);
        })
      ;
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
        // }).catch((err)=>{
        //   console.log("Got err");
      })
      ;
    });
  });
});
