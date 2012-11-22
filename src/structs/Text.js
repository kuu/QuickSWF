/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.Text = Text;

  var mStruct = global.quickswf.structs;

  /**
   * @constructor
   * @extends {Array}
   * @class {quickswf.structs.Text}
   */
  function Text() {
      ;
  }

  Text.prototype.displayListType = 'DefineText';

  /**
   * Loads a Text type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if parsing alpha is needed.
   * @return {quickswf.structs.Text} The loaded Text.
   */
  Text.load = function(pReader, pWithAlpha) {
    var TEXTRECORD = mStruct.TEXTRECORD;
    var tGlyphBits = pReader.B();
    var tAdvanceBits = pReader.B();
    var tText = new Text();
    var tTextRecord_1stB;
    var tTextRecords = new Array(0);
    while ((tTextRecord_1stB = pReader.B()) !== 0) {
        var tTextRecord = TEXTRECORD.load(pReader, tTextRecord_1stB, pWithAlpha, tGlyphBits, tAdvanceBits);
        tTextRecords.push(tTextRecord);
    }
    tText.textrecords = tTextRecords;
    return tText;
  };

}(this));
