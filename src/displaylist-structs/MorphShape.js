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

  MorphShape.prototype.displayListType = 'DefineMorphShape';

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

    var tStartEdges = tMorphShape.startEdges = mStructs.ShapeRecord.loadMultiple(pReader, tMorphShape, true, true);

    pReader.seekTo(pOffsetOfEndEdges);

    tMorphShape.numberOfFillBits = pReader.bp(4);
    tMorphShape.numberOfLineBits = pReader.bp(4);

    var tEndEdges = tMorphShape.endEdges = mStructs.ShapeRecord.loadMultiple(pReader, tMorphShape, true, true);
    var tEndEdge;

    for (var i = 0, il = tStartEdges.length; i < il; i++) {
      tEndEdge = tEndEdges[i];
      if (tEndEdge === void 0 || (tEndEdge.type === 1 && tStartEdges[i].type !== tEndEdge.type)) {
        tEndEdges.splice(i, 0, tStartEdges[i]);
      }
    }

    return tMorphShape;
  };

}(this));
