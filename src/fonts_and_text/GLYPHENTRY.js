/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.GLYPHENTRY = GLYPHENTRY;

  /**
   * @constructor
   * @class {quickswf.structs.GLYPHENTRY}
   */
  function GLYPHENTRY(pGlyphIndex, pGlyphAdvance) {
      this.index = pGlyphIndex;
      this.advance = pGlyphAdvance;
  }

  /**
   * Loads a GLYPHENTRY type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {number} pGlyphBits Bits in each glyph Index
   * @param {number} pAdvanceBits Bits in each advance value.
   * @return {quickswf.structs.GLYPHENTRY} The loaded GLYPHENTRY.
   */
  GLYPHENTRY.load = function(pReader, pGlyphBits, pAdvanceBits) {
    var tGlyphIndex = pReader.bp(pGlyphBits);
    var tGlyphAdvance = pReader.bp(pAdvanceBits);
    return new GLYPHENTRY(tGlyphIndex, tGlyphAdvance);
  };

}(this));
