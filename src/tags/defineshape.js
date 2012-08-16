(function(global) {
  
  global.quicktheatre.Parser.prototype['2'] = defineShape;
  global.quicktheatre.Parser.prototype['22'] = defineShape2;
  global.quicktheatre.Parser.prototype['32'] = defineShape3;

  var Rect = global.quicktheatre.structs.Rect;
  var Shape = global.quicktheatre.structs.Shape;

  function defineShape(pLength) {
    parseShape(this.r, false, false);
  }

  function defineShape2(pLength) {
    parseShape(this.r, false, true);
  }

  function defineShape3(pLength) {
    parseShape(this.r, true, true);
  }


  function parseShape(pReader, pWithAlpha, pHasLargeFillCount) {
    var tId = pReader.I16();
    var tBounds = Rect.load(pReader);

    var tWidth = tBounds.right - tBounds.left;
    var tHeight = tBounds.bottom - tBounds.top;

    var tShape = Shape.load(pReader, true, pWithAlpha, pHasLargeFillCount);
    console.log('DEFINESHAPE', tId, tBounds, tShape);
  }


}(this));
