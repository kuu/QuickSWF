/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 Yoshihiro Yamazaki
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
    global.quickswf.Parser.prototype['10'] = defineFont;

    var Font = global.quickswf.structs.Font;
    var Shape = global.quickswf.structs.Shape;

    function defineFont(pLength) {
        parseFont(this);
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

}(this));











