/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var mStructs = global.quickswf.structs;
  mStructs.MorphShape = MorphShape;

  /**
   * @constructor
   * @class {quickswf.structs.MorphShape}
   */
  function MorphShape() {
    this.id = -1;
    this.startBounds = null;
    this.endBounds = null;
    this.fillStyles = new Array();
    this.lineStyles = new Array();
    this.numberOfFillBits = 0;
    this.numberOfLineBits = 0;
    this.startEdges = new Array();
    this.endEdges = new Array();
  }

  MorphShape.prototype.displayListType = 4;

  /**
   * Loads a MorphShape type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {number} pOffsetOfEndEdges Offset of EndEdges
   * @param {bool} pWithStyles True if styles need to parsed.
   * @return {quickswf.structs.MorphShape} The loaded MorphShape.
   */
  MorphShape.load = function(pReader, pOffsetOfEndEdges, pWithStyles) {
    var tMorphShape = new MorphShape();

    if (pWithStyles) {
      tMorphShape.fillStyles = mStructs.FillStyle.loadMultiple(pReader, true, true, true);
      tMorphShape.lineStyles = mStructs.LineStyle.loadMultiple(pReader, true, true, true);
    }
    pReader.a();
    tMorphShape.numberOfFillBits = pReader.bp(4);
    tMorphShape.numberOfLineBits = pReader.bp(4);

    tMorphShape.startEdges = mStructs.ShapeRecord.loadMultiple(pReader, tMorphShape, true, true);

    pReader.seekTo(pOffsetOfEndEdges);

    tMorphShape.numberOfFillBits = pReader.bp(4);
    tMorphShape.numberOfLineBits = pReader.bp(4);

    tMorphShape.endEdges = mStructs.ShapeRecord.loadMultiple(pReader, tMorphShape, true, true);

    return tMorphShape;
  };

}(this));
