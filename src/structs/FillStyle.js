(function(global) {

  global.quickswf.structs.FillStyle = FillStyle;

  /**
   * @constructor
   * @class {quickswf.structs.FillStyle}
   */
  function FillStyle() {
    this.type = 0;
    this.color = null;
    this.matrix = null;
    this.gradient = null;
  }

  /**
   * Loads a FillStyle type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @return {quickswf.structs.FillStyle} The loaded FillStyle.
   */
  FillStyle.load = function(pReader, pWithAlpha) {
    var RGBA = global.quickswf.structs.RGBA;
    var Matrix = global.quickswf.structs.Matrix;
    var Gradient = global.quickswf.structs.Gradient;

    var tFillStyle = new FillStyle();
    var tType = tFillStyle.type = pReader.B();

    switch (tType) {
      case 0x00: // Solid fill
        tFillStyle.color = RGBA.load(pReader, pWithAlpha);
        break;
      case 0x10: // Linear gradient fill
      case 0x12: // Radial gradient fill
      case 0x13: // Focal radial gradient fill
        tFillStyle.matrix = Matrix.load(pReader);
        tFillStyle.gradient = Gradient.load(pReader, pWithAlpha);
        
        if (tType === 0x13) {
          tFillStyle.gradient.focalPoint = pReader.fpb8p(16);
        }
        break;
      case 0x40: // Repeating bitmap fill
      case 0x41: // Clipped bitmap fill
        tFillStyle.bitmapId = pReader.I16();
        tFillStyle.matrix = Matrix.load(pReader);
        if (tFillStyle.bitmapId === 0xFFFF) {
          tFillStyle.color = 'rgba(255, 0, 0, 1)';
          break;
        }
        // TODO: Abort if bitmap doesn't exist
        break;
      case 0x42: // Non-smoothed repeating bitmap
      case 0x43: // Non-smoothed clipped bitmap
        console.error('Non-smooted bitmaps are not supported');
        return;
      default:
        console.error('Unknown fill style type: ' + tType);
        return;
    }

    return tFillStyle;
  };

  /**
   * Loads an array of FillStyle types.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @param {bool} pHasLargeFillCount True if this struct can have more than 256 styles.
   * @return {Array.<quickswf.structs.FillStyle>} The loaded FillStyle array.
   */
  FillStyle.loadMultiple = function(pReader, pWithAlpha, pHasLargeFillCount) {
    var tCount = pReader.B();

    if (pHasLargeFillCount && tCount === 0xFF) {
      tCount = pReader.I16();
    }

    var tArray = new Array(tCount);

    for (var i = 0; i < tCount; i++) {
      tArray[i] = FillStyle.load(pReader, pWithAlpha);
    }

    return tArray;
  };

}(this));
