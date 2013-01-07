/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.Rect = Rect;

  /**
   * @constructor
   * @class {quickswf.structs.Rect}
   */
  function Rect(pLeft, pRight, pTop, pBottom) {
    this.left = pLeft;
    this.right = pRight;
    this.top = pTop;
    this.bottom = pBottom;
  }

  Rect.prototype.move = function (pXOffset, pYOffset) {
    this.left   += pXOffset;
    this.right  += pXOffset;
    this.top    += pYOffset;
    this.bottom += pYOffset;
  };

  Rect.prototype.clone  = function () {
    return new Rect(this.left, this.right, this.top, this.bottom);
  };

  /**
   * Loads a Rect type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.Rect} The loaded Rect.
   */
  Rect.load = function(pReader) {
    var tNumberOfBits = pReader.bp(5);
    var tLeft = pReader.bsp(tNumberOfBits);
    var tRight = pReader.bsp(tNumberOfBits);
    var tTop = pReader.bsp(tNumberOfBits);
    var tBottom = pReader.bsp(tNumberOfBits);

    pReader.a();

    return new Rect(tLeft, tRight, tTop, tBottom);
  };

}(this));
