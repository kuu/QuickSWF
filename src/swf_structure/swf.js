/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.SWF = SWF;

  /**
   * The data structure that holds all data
   * about an SWF file.
   * @constructor
   * @class {quickswf.SWF}
   */
  function SWF(pVersion, pWidth, pHeight, pFrameRate, pFrameCount) {
    this.version = pVersion;
    this.width = pWidth;
    this.height = pHeight;
    this.frameRate = pFrameRate;
    this.frameCount = pFrameCount;
    this.rootSprite = new global.quickswf.structs.Sprite();
    this.dictionary = new Object();
    this.fonts = new Object();
    this.jpegTableDQT = null;
    this.jpegTableDHT = null;
    this.streamSoundMetadata = null;
    this.mediaLoader = new global.quickswf.utils.MediaLoader();
  }

  SWF.prototype.destroy = function() {
    this.rootSprite = null;
    this.jpegTableDQT = null;
    this.jpegTableDHT = null;
    this.dictionary = null;
    this.fonts = null;
  };


}(this));
