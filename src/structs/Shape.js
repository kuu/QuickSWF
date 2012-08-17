(function(global) {

  var mStructs = global.quicktheatre.structs;
  mStructs.Shape = Shape;

  /**
   * @constructor
   * @class {quicktheatre.structs.Shape}
   */
  function Shape() {
    this.id = -1;
    this.bounds = null;
    this.fillStyles = new Array();
    this.lineStyles = new Array();
    this.numberOfFillBits = 0;
    this.numberOfLineBits = 0;
    this.records = new Array();
  }

  /**
   * Loads a Shape type.
   * @param {quicktheatre.Reader} pReader The reader to use.
   * @param {bool} pWithStyles True if styles need to parsed.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @param {bool} pHasLargeFillCount True if this struct can have more than 256 styles.
   * @return {quicktheatre.structs.Shape} The loaded Shape.
   */
  Shape.load = function(pReader, pWithStyles, pWithAlpha, pHasLargeFillCount) {
    var tShape = new Shape();

    if (pWithStyles) {
      tShape.fillStyles = mStructs.FillStyle.loadMultiple(pReader, pWithAlpha, pHasLargeFillCount);
      tShape.lineStyles = mStructs.LineStyle.loadMultiple(pReader, pWithAlpha);
    }
    tShape.numberOfFillBits = pReader.bp(4);
    tShape.numberOfLineBits = pReader.bp(4);
    tShape.records = mStructs.ShapeRecord.loadMultiple(pReader, tShape, pWithAlpha);
    
    return tShape;
  };

}(this));
