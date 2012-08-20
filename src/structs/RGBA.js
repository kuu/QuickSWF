(function(global) {

  global.quickswf.structs.RGBA = RGBA;

  /**
   * @constructor
   * @class {quickswf.structs.RGBA}
   */
  function RGBA(pRed, pGreen, pBlue, pAlpha) {
    this.red = pRed;
    this.green = pGreen;
    this.blue = pBlue;
    this.alpha = pAlpha;
  }

  RGBA.prototype.toString = function() {
    return 'rgba(' +
      this.red +
      ',' +
      this.green +
      ',' +
      this.blue +
      ',' +
      this.alpha +
      ')';
  };

  /**
   * Loads a colour RGBA type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha If this structure has alpha or not.
   * @return {quickswf.structs.RGBA} The loaded RGBA.
   */
  RGBA.load = function(pReader, pWithAlpha) {
    return new RGBA(
      pReader.B(),
      pReader.B(),
      pReader.B(),
      pWithAlpha ? pReader.B() / 255 : 1.0
    );
  };

}(this));
