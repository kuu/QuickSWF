(function(global) {

  global.quicktheatre.Parser = Parser;

  var mStructs = global.quicktheatre.structs;

  /**
   * @constructor
   */
  function Parser(pBuffer) {
    this.r = new global.quicktheatre.Reader(pBuffer);

  }

  Parser.prototype = /** @lends {quicktheatre.Parser#} */ {
    parse: function() {
      var tTimer = Date.now();
      var tReader = this.r;
      
      var tCompressedFlag = tReader.c();

      if (tCompressedFlag === 'C') {
        console.error('Currently compressed format is unsupported.');
        return false;
      } else if (tCompressedFlag !== 'F') {
        console.error('Invalid SWF format.');
        return false;
      }

      if (tReader.sp(2) !== 'WS') {
        console.error('Invalid SWF format.');
        return false;
      }

      var tVersion = tReader.B();

      if (tVersion > 4) {
        console.error('SWF version greater than 4 is not supported yet.');
      }

      var tFileSize = tReader.fileSize = tReader.I32();

      var tFrameSize = mStructs.Rect.load(tReader);
      tFrameSize.left /= 20;
      tFrameSize.right /= 20;
      tFrameSize.top /= 20;
      tFrameSize.bottom /= 20;

      var tWidth = tFrameSize.right - tFrameSize.left;
      var tHeight = tFrameSize.bottom - tFrameSize.top;

      var tFrameRate = tReader.I16() / 256;
      var tFrameCount = tReader.I16();

      console.log('Read header', tVersion, tFileSize, tWidth, tHeight, tFrameRate, tFrameCount);

      var self = this;

      function parseTag() {
        var tLocalReader = tReader;
        var tTypeAndLength = tLocalReader.I16();
        var tType = (tTypeAndLength >>> 6) + '';
        var tLength = tTypeAndLength & 0x3F;

        if (tLength === 0x3F) {
          tLength = tLocalReader.SI32();
        }

        var tExpectedFinalIndex = tLocalReader.tell() + tLength;

        if (!(tType in self)) {
          console.warn('Unknown tag: ' + tType);
          tLocalReader.seek(tLength);
        } else {
          self[tType + ''](tLength);
        }

        if (tLocalReader.tell() !== tExpectedFinalIndex) {
          console.error('Expected final index incorrect for tag ' + tType);
          tLocalReader.seekTo(tExpectedFinalIndex);
        }

        if (tLocalReader.tell() >= tFileSize) {
          console.log('Done parsing.');
          return;
        }

        if (Date.now() - tTimer >= 4500) {
          tTimer = 0;
          setTimeout(parseTag, 10);
        } else {
          parseTag();
        }
      }

      parseTag();

      return true;
    }
  };

}(this));
