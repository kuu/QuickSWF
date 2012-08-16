(function(global) {

  global.quicktheatre.structs.LineStyle = LineStyle;

  /**
   * @constructor
   * @class {quicktheatre.structs.LineStyle}
   */
  function LineStyle() {
    this.width = 0;
    this.color = null;
  }

  /**
   * Loads a LineStyle type.
   * @param {quicktheatre.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @return {quicktheatre.structs.LineStyle} The loaded LineStyle.
   */
  LineStyle.load = function(pReader, pWithAlpha) {
    var RGBA = global.quicktheatre.structs.RGBA;
    var tLineStyle = new LineStyle();
    tLineStyle.width = pReader.I16();
    tLineStyle.color = RGBA.load(pReader, pWithAlpha);

    return tLineStyle;
  };

  /**
   * Loads an array of LineStyle types.
   * @param {quicktheatre.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @param {bool} pHasLargeFillCount True if this struct can have more than 256 styles.
   * @return {Array.<quicktheatre.structs.LineStyle>} The loaded LineStyle array.
   */
  LineStyle.loadMultiple = function(pReader, pWithAlpha, pHasLargeFillCount) {
    var tCount = pReader.B();

    if (pHasLargeFillCount && tCount === 0xFF) {
      tCount = pReader.I16();
    }

    var tArray = new Array(tCount);

    for (var i = 0; i < tCount; i++) {
      tArray[i] = LineStyle.load(pReader, pWithAlpha);
    }

    return tArray;
  };

}(this));
