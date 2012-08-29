(function(global) {

  global.quickswf.SWF = SWF;
  var mStructs = global.quickswf.structs;

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
    this.rootSprite = new mStructs.Sprite();
    this.dictionary = new Object();
    this.jpegTableDQT = null;
    this.jpegTableDHT = null;
    this.images = new Object();
  }

  SWF.prototype.destroy = function() {
    for (var i in this.images) {
      var tImage = this.images[i];
      if (tImage.src.substring(0, 5) === 'blob:') {
        global.webkitURL.revokeObjectURL(tImage.src);
      }
    }
    this.images = null;
    this.rootSprite = null;
    this.jpegTableDQT = null;
    this.jpegTableDHT = null;
    this.dictionary = null;
  };


}(this));
