/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['11'] = defineText;
  global.quickswf.Parser.prototype['33'] = defineText2;

  var Rect = global.quickswf.structs.Rect;
  var Matrix = global.quickswf.structs.Matrix;
  var RGBA = global.quickswf.structs.RGBA;
  var TEXTRECORD = global.quickswf.structs.TEXTRECORD;

  /**
   * @constructor
   * @extends {Array}
   * @class {quickswf.structs.Text}
   */
  function Text() {
    this.fontID = -1;
    this.textColor = new RGBA(255, 255, 255, 1);
    this.xOffset = 0;
    this.yOffset = 0;
    this.textHeight = 240;
    this.xAdvance = 0;
    this.textrecords = null;
  }

  Text.prototype.displayListType = 'DefineText';

  /**
   * Loads a Text type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if parsing alpha is needed.
   * @return {quickswf.structs.Text} The loaded Text.
   */
  Text.load = function(pReader, pWithAlpha) {
    var tGlyphBits = pReader.B();
    var tAdvanceBits = pReader.B();
    var tText = new Text();
    var tTextRecord_1stB;
    var tTextRecords = new Array(0);
    while ((tTextRecord_1stB = pReader.B()) !== 0) {
        var tTextRecord = TEXTRECORD.load(pReader, tTextRecord_1stB, pWithAlpha, tGlyphBits, tAdvanceBits, tText);
        tTextRecords.push(tTextRecord);
    }
    tText.textrecords = tTextRecords;
    return tText;
  };

  function defineText(pLength) {
    parseText(this, false);
  }

  function defineText2(pLength) {
    parseText(this, true);
  }

  function parseText(pParser, withAlpha) {
    var tReader = pParser.r;
    var tId = tReader.I16();
    var tBounds = Rect.load(tReader);
    var tMatrix = Matrix.load(tReader);
    var tText = Text.load(tReader, withAlpha);
    tText.id = tId;
    tText.bounds = tBounds;
    tText.matrix = tMatrix;
    pParser.swf.dictionary[tId+ ""] = tText;
  }

}(this));
