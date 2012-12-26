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
   * @param {quickswf.structs.Text} pText DefineText object which has this TEXTRECORD.
   * @return {quickswf.structs.TEXTRECORD} The loaded TEXTRECORD.
   */
  TEXTRECORD.load = function(pReader, p_1stB, pWithAlpha, pGlyphBits, pAdvanceBits, pText) {
    var RGBA = mStruct.RGBA;
    var GLYPHENTRY = mStruct.GLYPHENTRY;
    var tTextRecordType = p_1stB >>> 7;
    var tStyleFlags = p_1stB;
    var tTextColor = null;
    
    if (tStyleFlags & 0x08) { // StyleFlagsHasFont
        pText.fontID = pReader.I16();        
    }
    if (tStyleFlags & 0x04) { // StyleFlagsHasColor
        pText.textColor = RGBA.load(pReader, pWithAlpha);
    }
    if (tStyleFlags & 0x01) { // StyleFlagsHasXOffset
        pText.xOffset = pReader.I16();
        pText.xAdvance = 0;
    }
    if (tStyleFlags & 0x02) { // StyleFlagsHasYOffset
        pText.yOffset = pReader.I16();
    }
    if (tStyleFlags & 0x08) { // StyleFlagsHasFont
        pText.textHeight = pReader.I16();
    }

    var tTEXTRECORD = new TEXTRECORD;

    tTEXTRECORD.type = tTextRecordType;
    tTEXTRECORD.styleflags = tStyleFlags;
    tTEXTRECORD.id = pText.fontID;
    tTEXTRECORD.color = pText.textColor;
    tTEXTRECORD.x = pText.xOffset;
    tTEXTRECORD.y = pText.yOffset;
    tTEXTRECORD.height = pText.textHeight;
    tTEXTRECORD.xAdvance = pText.xAdvance;

    var tGlyphCount = pReader.B();
    var tGlypyEntries = new Array(tGlyphCount);

    for (var i = 0; i < tGlyphCount; i++) {
        tGlypyEntries[i] = GLYPHENTRY.load(pReader, pGlyphBits, pAdvanceBits);
        pText.xAdvance += tGlypyEntries[i].advance;
    }

    tTEXTRECORD.glyphs = tGlypyEntries;

    pReader.a();

    return tTEXTRECORD;
  };

}(this));
