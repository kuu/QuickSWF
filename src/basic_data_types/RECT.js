/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.RECT = RECT;

  /**
   * @constructor
   * @class {quickswf.structs.RECT}
   */
  function RECT(pLeft, pRight, pTop, pBottom) {
    this.left = pLeft;
    this.right = pRight;
    this.top = pTop;
    this.bottom = pBottom;
  }

  RECT.prototype.move = function (pXOffset, pYOffset) {
    this.left   += pXOffset;
    this.right  += pXOffset;
    this.top    += pYOffset;
    this.bottom += pYOffset;
  };

  RECT.prototype.clone  = function () {
    return new RECT(this.left, this.right, this.top, this.bottom);
  };

  /**
   * Loads a RECT type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.RECT} The loaded RECT.
   */
  RECT.load = function(pReader) {
    var tNumberOfBits = pReader.bp(5);
    var tLeft = pReader.bsp(tNumberOfBits);
    var tRight = pReader.bsp(tNumberOfBits);
    var tTop = pReader.bsp(tNumberOfBits);
    var tBottom = pReader.bsp(tNumberOfBits);

    pReader.a();

    return new RECT(tLeft, tRight, tTop, tBottom);
  };

}(this));
