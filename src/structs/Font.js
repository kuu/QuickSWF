/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF Project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.Font = Font;

  var mStruct = global.quickswf.structs;

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
    var Shape = mStruct.Shape;
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

}(this));
