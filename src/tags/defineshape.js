(function(global) {
  
  global.quicktheatre.Parser.prototype['2'] = defineShape;
  global.quicktheatre.Parser.prototype['22'] = defineShape2;
  global.quicktheatre.Parser.prototype['32'] = defineShape3;

  var Rect = global.quicktheatre.structs.Rect;
  var Shape = global.quicktheatre.structs.Shape;

  function defineShape(pLength) {
    parseShape(this, false, false);
  }

  function defineShape2(pLength) {
    parseShape(this, false, true);
  }

  function defineShape3(pLength) {
    parseShape(this, true, true);
  }


  function parseShape(pParser, pWithAlpha, pHasLargeFillCount) {
    var tReader = pParser.r;
    var tId = tReader.I16();
    var tBounds = Rect.load(tReader);
    var tShape = Shape.load(tReader, true, pWithAlpha, pHasLargeFillCount);

    tShape.id = tId;
    tShape.bounds = tBounds;

    pParser.swf.dictionary[tId + ''] = tShape;
  }


}(this));
