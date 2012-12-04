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
  var mFonts = {};
  var mFontID = 0;
  var mFont = null;
  TEXTRECORD.load = function(pReader, p_1stB, pWithAlpha, pGlyphBits, pAdvanceBits, pText) {
    var RGBA = mStruct.RGBA;
    var GLYPHENTRY = mStruct.GLYPHENTRY;
    var tTextRecordType = p_1stB >>> 7;
    var tStyleFlags = p_1stB;
    var tTextColor = null;
    
    if (tStyleFlags & 0x08) { // StyleFlagsHasFont
        mFontID = pReader.I16();
        if (mFonts[mFontID] === void 0) {
          mFonts[mFontID] = {
              textColor: new RGBA(255, 255, 255, 1),
              xOffset: 0,
              yOffset: 0,
              textHeight: 0
            };
        }
        mFont = mFonts[mFontID];
    }
    if (tStyleFlags & 0x04) { // StyleFlagsHasColor
        mFont.textColor = RGBA.load(pReader, pWithAlpha);
    }
    if (tStyleFlags & 0x01) { // StyleFlagsHasXOffset
        mFont.xOffset = pReader.I16();
        pText.xAdvance = 0;
    }
    if (tStyleFlags & 0x02) { // StyleFlagsHasYOffset
        mFont.yOffset = pReader.I16();
    }
    if (tStyleFlags & 0x08) { // StyleFlagsHasFont
        mFont.textHeight = pReader.I16();
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
    tTEXTRECORD.id = mFontID;
    tTEXTRECORD.color = mFont.textColor;
    tTEXTRECORD.x = mFont.xOffset;
    tTEXTRECORD.y = mFont.yOffset;
    tTEXTRECORD.height = mFont.textHeight;
    tTEXTRECORD.glyphs = tGlypyEntries;

    return tTEXTRECORD;
  };

}(this));
