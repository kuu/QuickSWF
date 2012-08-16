(function(global) {

  global.quicktheatre.structs.ColorTransform = ColorTransform;

  /**
   * @constructor
   * @class {quicktheatre.structs.Transform}
   */
  function ColorTransform() {
    this.rm = 1;
    this.gm = 1;
    this.bm = 1;
    this.am = 1;

    this.ra = 0;
    this.ga = 0;
    this.ba = 0;
    this.aa = 0;
  }

  /**
   * Loads a ColorTransform type.
   * @param {quicktheatre.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha If this struct has alpha to load.
   * @return {quicktheatre.structs.ColorTransform} The loaded ColorTransform.
   */
  ColorTransform.load = function(pReader, pWithAlpha) {
    var tHasAdditive = pReader.b();
    var tHasMultiplitive = pReader.b();
    var tNumberOfBits = pReader.bp(4);

    var tTransform = new ColorTransform();

    if (tHasMultiplitive === 1) {
      tTransform.rm = pReader.bsp(tNumberOfBits) / 256;
      tTransform.gm = pReader.bsp(tNumberOfBits) / 256;
      tTransform.bm = pReader.bsp(tNumberOfBits) / 256;
      if (pWithAlpha === true) {
        tTransform.am = pReader.bsp(tNumberOfBits) / 256;
      }
    }

    if (tHasAdditive === 1) {
      tTransform.ra = pReader.bsp(tNumberOfBits) / 256;
      tTransform.ga = pReader.bsp(tNumberOfBits) / 256;
      tTransform.ba = pReader.bsp(tNumberOfBits) / 256;
      if (pWithAlpha === true) {
        tTransform.aa = pReader.bsp(tNumberOfBits) / 256;
      }
    }

    pReader.a();

    return tTransform;
  };

}(this));
