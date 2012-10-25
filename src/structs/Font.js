/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 Yoshihiro Yamazaki
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.Font = Font;

  var Shape = global.quickswf.structs.Shape;

  /**
   * @constructor
   * @extends {Array}
   * @class {quickswf.structs.Font}
   */
  function Font() {

  }

  Font.prototype = [];

  /**
   * Loads a Rect type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.Font} The loaded Font.
   */
  Font.load = function(pReader, pOffsetOfOffsetTable, pOffsetTable) {
    var tFont = new Font();
    var tNumGlyphs = pOffsetTable.length;
    var tGlyphShapeTable = new Array(tNumGlyphs);
    for (var i = 0 ; i < tNumGlyphs ; i++) {
        tReader.seekTo(pOffsetOfOffsetTable + pOffsetTable[i]);
        var tShape = Shape.load(pReader, true, false, false);
        tGlyphShapeTable[i] = tShape;
    }
    this.shapes = tGlyphShapeTable[i];
    return tFont;
  };

}(this));
