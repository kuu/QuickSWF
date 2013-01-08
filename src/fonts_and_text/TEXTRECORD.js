/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var mStruct = global.quickswf.structs;
  mStruct.TEXTRECORD = TEXTRECORD;
  var RGBA = mStruct.RGBA;
  var GLYPHENTRY = mStruct.GLYPHENTRY;

  /**
   * @constructor
   * @class {quickswf.structs.TEXTRECORD}
   */
  function TEXTRECORD() {
    this.type = 0;
    this.styleflags = 0;
    this.id = -1;
    this.color = null;
    this.x = 0;
    this.y = 0;
    this.height = 0;
    this.xAdvance = 0;
    this.glyphs = null;
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
