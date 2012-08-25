(function(global) {

  global.quickswf.Parser = Parser;

  var mStructs = global.quickswf.structs;
  var SWF = global.quickswf.SWF;

  /**
   * @constructor
   */
  function Parser(pBuffer) {
    /**
     * The Breader object for this parser.
     * @type {Breader}
     */
    this.r = new global.Breader(pBuffer);

    /**
     * The SWF object that gets created after parsing.
     * @type {quickswf.SWF}
     */
    this.swf = null;

    /**
     * The currently being parsed frame index.
     * @type {Number}
     */
    this.currentFrame = 0;

    /**
     * A stack of frame indices to keep track of while parsing.
     * @type {Array.<Number>}
     */
    this.frameStack = new Array();

    /**
     * A stack of Sprites to keep track of while parsing.
     * @type {Array.<quickswf.structs.Sprite>}
     */
    this.spriteStack = new Array();

    /**
     * The currently being parsed Sprite.
     * @type {quickswf.structs.Sprite}
     */
    this.currentSprite = null;
  }

  Parser.prototype = /** @lends {quickswf.Parser#} */ {

    /**
     * Adds a new action to the current frame
     * of the current sprite.
     * @param {Object} pData The data. Make sure it has a type property of type String.
     */
    add: function(pData) {
      var tFrames = this.currentSprite.frames;
      var tIndex = this.currentFrame;
      var tRealData = new Object();
      for (var k in pData) {
        tRealData[k] = pData[k];
      }

      if (tFrames[tIndex] === void 0) {
        tFrames[tIndex] = [tRealData];
      } else {
        tFrames[tIndex].push(tRealData);
      }
    },

    /**
     * Parses the current buffer.
     * @param {Function=} pSuccessCallback The callback to call on success.
     * @param {Function=} pFailureCallback The callback to call on failure.
     */
    parse: function(pSuccessCallback, pFailureCallback) {
      var tTimer = Date.now();
      var tReader = this.r;
      
      var tCompressedFlag = tReader.c();

      if (tCompressedFlag === 'C') {
        pFailureCallback && pFailureCallback('Currently compressed format is unsupported.');
        return false;
      } else if (tCompressedFlag !== 'F') {
        pFailureCallback && pFailureCallback('Invalid SWF format.');
        return false;
      }

      if (tReader.sp(2) !== 'WS') {
        pFailureCallback && pFailureCallback('Invalid SWF format.');
        return false;
      }

      var tVersion = tReader.B();

      /*if (tVersion > 4) {
        pFailureCallback && pFailureCallback('SWF version greater than 4 is not yet supported.');
        return false;
      }*/

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

      var tSWF = this.swf = new SWF(tVersion, tWidth, tHeight, tFrameRate, tFrameCount);

      this.currentSprite = tSWF.rootSprite;
      this.currentSprite.id = 0;
      this.currentSprite.frameCount = tFrameCount;
      this.currentSprite.frames.length = tFrameCount;

      var self = this;

      function parseTag() {
        var tLocalReader = tReader;

        for (;;) {
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

          // Forgive the hack for DefineSprite (39). It's length is for all the tags inside of it.
          if (tType !== '39' && tLocalReader.tell() !== tExpectedFinalIndex) {
            console.error('Expected final index incorrect for tag ' + tType);
            tLocalReader.seekTo(tExpectedFinalIndex);
          }

          if (tLocalReader.tell() >= tFileSize) {
            pSuccessCallback && pSuccessCallback(tSWF);
            return;
          }

          if (Date.now() - tTimer >= 4500) {
            tTimer = 0;
            setTimeout(parseTag, 10);
            return;
          }
        }
      }

      parseTag();

      return true;
    }
  };

}(this));
