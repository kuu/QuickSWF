/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.TEXTRECORD = TEXTRECORD;

  var mStruct = global.quickswf.structs;

  /**
   * @constructor
   * @class {quickswf.structs.TEXTRECORD}
   */
  function TEXTRECORD() {
      ;
  }

  /**
   * Loads a TEXTRECORD type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {number} p_1stB First byte of TextRecord.
   * @param {bool} pWithAlpha True if parsing alpha is needed.
   * @param {number} pGlyphBits Bits in each glyph Index
   * @param {number} pAdvanceBits Bits in each advance value.
   * @return {quickswf.structs.TEXTRECORD} The loaded TEXTRECORD.
   */
  TEXTRECORD.load = function(pReader, p_1stB, pWithAlpha, pGlyphBits, pAdvanceBits) {
    var RGBA = mStruct.RGBA;
    var GLYPHENTRY = mStruct.GLYPHENTRY;
    var tTextRecordType = p_1stB >>> 7;
    var tStyleFlags = p_1stB;
    var tFontID = null;
    var tTextColor = null;
    var tXOffset = null;
    var tYOffset = null;
    var tTextHeight = null;
    
    if (tStyleFlags & 0x08) { // StyleFlagsHasFont
        tFontID = pReader.I16();
    }
    if (tStyleFlags & 0x04) { // StyleFlagsHasColor
        tTextColor = RGBA.load(pReader, pWithAlpha);
    }
    if (tStyleFlags & 0x01) { // StyleFlagsHasXOffset
        tXOffset = pReader.I16();
    }
    if (tStyleFlags & 0x02) { // StyleFlagsHasYOffset
        tYOffset = pReader.I16();
    }
    if (tStyleFlags & 0x08) { // StyleFlagsHasFont
        tTextHeight = pReader.I16();
    }

    var tGlyphCount = pReader.B();
    var tGlypyEntries = new Array(tGlyphCount);

    for (var i = 0; i < tGlyphCount; i++) {
       tGlypyEntries[i] = GLYPHENTRY.load(pReader, pGlyphBits, pAdvanceBits);
    }
    pReader.a();

    var tTEXTRECORD = new TEXTRECORD();
    
    tTEXTRECORD.type = tTextRecordType;
    tTEXTRECORD.styleflags = tStyleFlags;
    tTEXTRECORD.id = tFontID;
    tTEXTRECORD.color = tTextColor;
    tTEXTRECORD.x = tXOffset;
    tTEXTRECORD.y = tYOffset;
    tTEXTRECORD.height = tTextHeight;
    tTEXTRECORD.glyphs = tGlypyEntries;

    return tTEXTRECORD;
  };

}(this));
