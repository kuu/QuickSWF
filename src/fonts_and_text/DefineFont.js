/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 Yoshihiro Yamazaki
 * This code is licensed under the zlib license. See LICENSE for details.
 */
 (function(global) {

    global.quickswf.Parser.prototype['10'] = defineFont;
    global.quickswf.Parser.prototype['48'] = defineFont2;

    var Rect = global.quickswf.structs.Rect;
    var Shape = global.quickswf.structs.Shape;
    var KERNINGRECORD = global.quickswf.structs.KERNINGRECORD;;

  /**
   * @constructor
   * @extends {Array}
   * @class {quickswf.structs.Font}
   */
  function Font() {
    this.id = -1;
    this.shiftJIS = false;
    this.smalltext = false;
    this.ansi = false;
    this.italic = false;
    this.bold = false;
    this.langCode = 0;
    this.name = null;
    this.codeTable = null;
    this.ascent = 0;
    this.descent = 0;
    this.leading = 0;
    this.advanceTable = null;
    this.boundsTable = null;
    this.kerningTable = null;
    this.lookupTable = null;
    this.shapes = null;
  }

  /**
   * Loads a Font type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.Font} The loaded Font.
   */
  Font.load = function(pReader, pOffsetOfOffsetTable, pOffsetTable) {
    var tFont = new Font();
    if (pOffsetOfOffsetTable === null) {
        return tFont;
    }
    var tNumGlyphs = pOffsetTable.length;
    var tGlyphShapeTable = new Array(tNumGlyphs);
    for (var i = 0 ; i < tNumGlyphs ; i++) {
        pReader.seekTo(pOffsetOfOffsetTable + pOffsetTable[i]);
        var tShape = Shape.load(pReader, false, false, false);
        tGlyphShapeTable[i] = tShape;
    }
    tFont.shapes = tGlyphShapeTable;
    return tFont;
  };

    function defineFont(pLength) {
        parseFont(this);
    }

    function defineFont2(pLength) {
        parseFont2(this);
    }

    function parseFont(pParser) {
        var tReader = pParser.r;
        var tId = tReader.I16();
        var tOffsetOfOffsetTable = tReader.tell();
        var tOfOffsetTable_0 = tReader.I16();
        var tNumGlyphs = tOfOffsetTable_0 / 2;
        var tOffsetTable = new Array(tNumGlyphs);
        tOffsetTable[0] = tOfOffsetTable_0;
        for (var i = 1 ; i < tNumGlyphs ; i++) {
            tOffsetTable[i] = tReader.I32();
        }
        var tFont = Font.load(tReader, tOffsetOfOffsetTable, tOffsetTable);
        tFont.id = tId;

        pParser.swf.fonts[tId] = tFont;
    }

    function parseFont2(pParser) {
        var tReader = pParser.r;
        var tId = tReader.I16();
        var tFlags = tReader.B();
        var tFontFlagsHasLayout   = (tFlags & 0x80)?true:false;
        var tFontFlagsShiftJIS    = (tFlags & 0x40)?true:false;
        var tFontFlagsSmallText   = (tFlags & 0x20)?true:false;
        var tFontFlagsANSI        = (tFlags & 0x10)?true:false;
        var tFontFlagsWideOffsets = (tFlags & 0x08)?true:false;
        var tFontFlagsWideCodes   = (tFlags & 0x04)?true:false;
        var tFontFlagsItalic      = (tFlags & 0x02)?true:false;
        var tFontFlagsBold        = (tFlags & 0x01)?true:false;
        var tLangCode = tReader.B();
        var tFontNameLen = tReader.B();
        var tFontName = (tFontNameLen > 0)?tReader.sp(tFontNameLen):null;
        var tNumGlyphs = tReader.I16();
        if (tNumGlyphs === 0) { // no Glyphs
            var tFont = Font.load(tReader, null, null);
            if (tFontFlagsShiftJIS && !tFontFlagsANSI) {
              // Need to skip CodeTableOffset...
              tFontFlagsWideOffsets ? tReader.I32() : tReader.I16();
            }
            tFont.id = tId;
            tFont.shiftJIS = tFontFlagsShiftJIS;
            tFont.smalltext =tFontFlagsSmallText;
            tFont.ansi = tFontFlagsANSI;
            tFont.italic = tFontFlagsItalic;
            tFont.bold = tFontFlagsBold;
            tFont.langCode = tLangCode;
            tFont.name = tFontName;
            pParser.swf.fonts[tId] = tFont;
            return ;
        }
        var tOffsetTable = new Array(tNumGlyphs);
        var tCodeTableOffset = 0;
        var tOffsetOfOffsetTable = tReader.tell();
        if (tFontFlagsWideOffsets) {
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tOffsetTable[i] = tReader.I32();
            }
            tCodeTableOffset = tReader.I32();
        } else {
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tOffsetTable[i] = tReader.I16();
            }
            tCodeTableOffset = tReader.I16();
        }
        var tFont = Font.load(tReader, tOffsetOfOffsetTable, tOffsetTable);
        tReader.seekTo(tOffsetOfOffsetTable + tCodeTableOffset);
        var tCodeTable = new Array(tNumGlyphs);
        if (tFontFlagsWideCodes) {
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tCodeTable[i] = tReader.I16();
            }
        } else {
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tCodeTable[i] = tReader.B();
            }
        }
        var tFontAscent = 0;
        var tFontDescent = 0;
        var tFontLeading = 0;
        var tFontAdvanceTable = new Array(tNumGlyphs);
        var tFontBoundsTable = new Array(tNumGlyphs);
        var tKerningCount = 0;
        var tFontKerningTable = null;

        if (tFontFlagsHasLayout) {
            tFontAscent = tReader.SI16();
            tFontDescent = tReader.SI16();
            tFontLeading = tReader.SI16();
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tFontAdvanceTable[i] = tReader.SI16();
            }
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tFontBoundsTable[i] = Rect.load(tReader);
            }
            tKerningCount = tReader.I16();
            tFontKerningTable = new Array(tKerningCount);
            for (var i = 0 ; i < tKerningCount; i++) {
                tFontKerningTable[i] = KERNINGRECORD.load(tReader, tFontFlagsWideCodes);
            }
        }

        //
        tFont.id = tId;
        tFont.shiftJIS = tFontFlagsShiftJIS;
        tFont.smalltext =tFontFlagsSmallText;
        tFont.ansi = tFontFlagsANSI;
        tFont.italic = tFontFlagsItalic;
        tFont.bold = tFontFlagsBold;
        tFont.langCode = tLangCode;
        tFont.name = tFontName;
        tFont.codeTable = tCodeTable;
        tFont.ascent = tFontAscent;
        tFont.descent = tFontDescent;
        tFont.leading = tFontLeading;
        tFont.advanceTable = tFontAdvanceTable;
        tFont.boundsTable = tFontBoundsTable;
        tFont.kerningTable = tFontKerningTable;

        // Lookup table for search by char code.
        var tTable = tFont.lookupTable = new Object();
        var tShapes = tFont.shapes; 
        for (var i = 0; i < tNumGlyphs; i++) {
          var tEntry = new Object();
          tEntry.shape = tShapes[i];
          if (tFontFlagsHasLayout) {
            tEntry.advance = tFontAdvanceTable[i];
            tEntry.bounds = tFontBoundsTable[i];
          }
          tTable[tCodeTable[i] + ''] = tEntry;
        }
        pParser.swf.fonts[tId] = tFont;
    }

}(this));
