/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['46'] = defineMorphShape;

  var Rect = global.quickswf.structs.Rect;
  var MorphShape = global.quickswf.structs.MorphShape;

  function defineMorphShape(pLength) {
    parseMorphShape(this);
  }


  function parseMorphShape(pParser) {
    var tReader = pParser.r;
    var tId = tReader.I16();
    var tStartBounds = Rect.load(tReader);
    var tEndBounds = Rect.load(tReader);
    var tOffset = tReader.I32();
    var tOffsetOfOffset = tReader.tell();

    var tMorphShape = MorphShape.load(tReader, tOffsetOfOffset + tOffset, true, true);
    tMorphShape.id = tId;
    tMorphShape.startBounds = tStartBounds;
    tMorphShape.endBounds = tEndBounds;

    pParser.swf.dictionary[tId + ''] = tMorphShape;
  }

}(this));
