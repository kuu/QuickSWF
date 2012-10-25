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
    var Font = global.quickswf.structs.Font;

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
        var tLangCode = tReader.B();
        var tFontNameLen = tReader.B();
        var tFontName = (tFontNameLen > 0)?tReader.sp(tFontNameLen):null;
        var tNumGlyphs = tReader.I16();
        var tOffsetTable = new Array(tNumGlyphs);
        var tCodeTableOffset = 0;
        var tOffsetOfOffsetTable = tReader.tell();
        if (tFlags & 0x80) { // FontFlagsWideOffsets
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
        if (tFlags & 0x40) { // FontFlagsWideCodes
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tCodeTable[i] = tReader.I16();
            }
        } else {
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tCodeTable[i] = tReader.B();
            }
        }
        var tFontAscent = null;
        var tFontDescent = null;
        var tFontLeading = null;
        var tFontAdvanceTable = new Array(tNumGlyphs);
        var tFontBoundsTable = new Array(tNumGlyphs);
        var tKerningCount = null;
        var tFontKerningTable = null;
        
        if (tFlags & 0x80) { // FontFlagsHasLayout
            tFontAscent = tReader.I16();
            tFontDescent = tReader.I16();
            tFontLeading = tReader.I16();
            tFontAdvanceTable = tReader.I16();
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tFontBoundsTable = Rect.load(tReader);
            }
            tKerningCount = tReader.I16();
            tFontKerningTable = new Array(tKerningCount);
            var tFlagWideCodes = (tFlags & 0x40)?true:false;
            for (var i = 0 ; i < tNumGlyphs ; i++) {
                tFontKerningTable = KERNINGRECORD.load(tReader, tFlagWideCodes);
            }
        }
        
        //
        tFont.id = tId;
        tFont.flags = tFlags;
        tFont.name = tFontName;
        tFont.codetable = tCodeTable;
        tFont.ascent = tFontAscent;
        tFont.descent = tFontDescent;
        tFont.leading = tFontLeading;
        tFont.advancetable = tFontAdvanceTable;
        tFont.boundstable = tFontBoundsTable;
        tFont.kerningtable = tFontKerningTable;
        
        pParser.swf.fonts[tId] = tFont;
    }

}(this));











