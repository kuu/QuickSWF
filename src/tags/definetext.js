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
  var Text = global.quickswf.structs.Text;

  function defineText(pLength) {
    parseText(this, false);
  }

  function defineText2(pLength) {
    parseText2(this, true);
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
