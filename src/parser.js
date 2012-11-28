/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
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

      if (tCompressedFlag !== 'C' && tCompressedFlag !== 'F') {
        pFailureCallback && pFailureCallback('Invalid SWF format.');
        return false;
      }

      if (tReader.sp(2) !== 'WS') {
        pFailureCallback && pFailureCallback('Invalid SWF format.');
        return false;
      }

      var tVersion = tReader.B();
      var tFileSize = tReader.I32();

      if (tCompressedFlag === 'C') {
        var tInflater = new Zlib.Inflate(tReader.sub(tReader.tell(), tReader.fileSize - tReader.tell()));
        tReader = this.r = new Breader(tInflater.decompress());
      }
      tReader.fileSize = tFileSize;

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
            var tImagesToWaitFor = [];
            var tImages = tSWF.images;
            // It's ugly to have the same code for each media type.
            // Let's clean up later.
            var tSounds = tSWF.eventSounds;
            var tSoundsToWaitFor = [];
            var tConvertedStrings = tSWF.convstr;
            var tStringsToWaitFor = [];
            var i;

            for (i in tImages) {
              if (tImages[i].complete === true) {
                tImages[i] = tImages[i].data;
              } else {
                tImagesToWaitFor.push(tImages[i]);
              }
            }
            for (i in tSounds) {
              if (tSounds[i].complete === true) {
                tSounds[i] = tSounds[i].data;
              } else {
                tSoundsToWaitFor.push(tSounds[i]);
              }
            }
            for (i in tConvertedStrings) {
              if (tConvertedStrings[i].complete === true) {
                self.swf.dictionary[tConvertedStrings[i].id + ''] = tConvertedStrings[i].data;
                delete tConvertedStrings[tConvertedStrings[i].id + ''];
              } else {
                tStringsToWaitFor.push(tConvertedStrings[i]);
              }
            }

            if (tImagesToWaitFor.length === 0 && tSoundsToWaitFor.length === 0 && tStringsToWaitFor.length === 0) {
              pSuccessCallback && pSuccessCallback(tSWF);
            } else {
              setTimeout(function wait() {
                for (i = tImagesToWaitFor.length - 1; i >= 0; i--) {
                  if (tImagesToWaitFor[i].complete === true) {
                    tImages[tImagesToWaitFor[i].id] = tImagesToWaitFor[i].data;
                    tImagesToWaitFor.splice(i, 1);
                  }
                }
                for (i = tSoundsToWaitFor.length - 1; i >= 0; i--) {
                  if (tSoundsToWaitFor[i].complete === true) {
                    tSounds[tSoundsToWaitFor[i].id] = tSoundsToWaitFor[i].data;
                    tSoundsToWaitFor.splice(i, 1);
                  }
                }
                for (i = tStringsToWaitFor.length - 1; i >= 0; i--) {
                  if (tStringsToWaitFor[i].complete === true) {
                    self.swf.dictionary[tStringsToWaitFor[i].id + ''] = tStringsToWaitFor[i].data;
                    delete tConvertedStrings[tStringsToWaitFor[i].id + ''];
                    tStringsToWaitFor.splice(i, 1);
                  }
                }

                if (tImagesToWaitFor.length === 0 && tSoundsToWaitFor.length === 0 && tStringsToWaitFor.length === 0) {
                  pSuccessCallback && pSuccessCallback(tSWF);
                } else {
                  setTimeout(wait, 10);
                }
              }, 10);
            }
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
