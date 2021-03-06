/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.CXFORM = CXFORM;

  /**
   * @constructor
   * @class {quickswf.structs.CXFORM}
   */
  function CXFORM() {
    this.rm = 1;
    this.gm = 1;
    this.bm = 1;
    this.am = 1;

    this.ra = 0;
    this.ga = 0;
    this.ba = 0;
    this.aa = 0;
  }

  CXFORM.prototype.clone = function() {
    var tColorTransform = new CXFORM();

    tColorTransform.rm = this.rm;
    tColorTransform.gm = this.gm;
    tColorTransform.bm = this.bm;
    tColorTransform.am = this.am;

    tColorTransform.ra = this.ra;
    tColorTransform.ga = this.ga;
    tColorTransform.ba = this.ba;
    tColorTransform.aa = this.aa;

    return tColorTransform;
  }

  /**
   * Loads a CXFORM type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha If this struct has alpha to load.
   * @return {quickswf.structs.CXFORM} The loaded CXFORM.
   */
  CXFORM.load = function(pReader, pWithAlpha) {
    var tHasAdditive = pReader.bp(1);
    var tHasMultiplitive = pReader.bp(1);
    var tNumberOfBits = pReader.bp(4);

    var tTransform = new CXFORM();

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
