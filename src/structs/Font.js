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

  }

  /**
   * Loads a Rect type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.Font} The loaded Font.
   */
  Font.load = function(pReader, pOffsetOfOffsetTable, pOffsetTable) {
    var Shape = mStruct.Shape;
    var tFont = new Font();
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
