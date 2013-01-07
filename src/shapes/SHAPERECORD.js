/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var mStructs = global.quickswf.structs;
  mStructs.ShapeRecord = ShapeRecord;
  var FillStyle = mStructs.FillStyle;
  var LineStyle = mStructs.LineStyle;

  /**
   * @constructor
   * @class {quickswf.structs.ShapeRecord}
   */
  function ShapeRecord() {

  }

  /**
   * Loads a ShapeRecord type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.ShapeRecord} The loaded ShapeRecord.
   */
  ShapeRecord.load = function(pReader) {
    var tShapeRecord = new ShapeRecord();

    return tShapeRecord;
  };

  /**
   * Loads multple ShapeRecords.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {quickswf.Shape} pShape The Shape these ShapeRecords belong to.
   * @param {bool} pWithAlpha True if parsing alpha is needed.
   * @param {bool} pIsMorph True if morph shape.
   * @return {Array.<quickswf.structs.ShapeRecord>} The loaded ShapeRecords.
   */
  ShapeRecord.loadMultiple = function(pReader, pShape, pWithAlpha, pIsMorph) {
    var tRecords = new Array();
    var i = 0;
    var tStyleChanged;

    for (;;) {
      if (pReader.bp(1) === 0) { // Is edge flag
        if (pReader.peekBits(5) === 0) { // End of records.
          pReader.bp(5);
          break;
        } else {
          tStyleChanged = tRecords[i++] = parseStyleChanged(pReader, pShape.numberOfFillBits, pShape.numberOfLineBits, pWithAlpha, pIsMorph);
          pShape.numberOfFillBits = tStyleChanged.fillBits;
          pShape.numberOfLineBits = tStyleChanged.lineBits;
        }
      } else {
        if (pReader.bp(1) === 1) { // Is straight record
          tRecords[i++] = parseStraightEdge(pReader);
        } else {
          tRecords[i++] = parseCurvedEdge(pReader);
        }
      }
    }

    pReader.a();

    return tRecords;
  };

  function EdgeRecord(pType, pDeltaX, pDeltaY, pDeltaControlX, pDeltaControlY) {
    this.type = pType;
    this.deltaX = pDeltaX;
    this.deltaY = pDeltaY;
    this.deltaControlX = pDeltaControlX;
    this.deltaControlY = pDeltaControlY;
  }

  function StyleChangeRecord(pNumberOfFillBits, pNumberOfLineBits) {
    this.type = 1;
    this.hasMove = false;
    this.moveDeltaX = 0;
    this.moveDeltaY = 0;
    this.fillStyle0 = -1;
    this.fillStyle1 = -1;
    this.lineStyle = -1;
    this.fillBits = pNumberOfFillBits;
    this.lineBits = pNumberOfLineBits;
    this.fillStyles = null;
    this.lineStyles = null;
  }

  function parseStraightEdge(pReader) {
    var tNumberOfBits = pReader.bp(4) + 2;
    var tGeneralLineFlag = pReader.bp(1);
    var tVerticalLineFlag = 0;

    if (tGeneralLineFlag === 0) {
      tVerticalLineFlag = pReader.bp(1);
    }

    var tDeltaX = 0;
    var tDeltaY = 0;

    if (tGeneralLineFlag === 1 || tVerticalLineFlag === 0) {
      tDeltaX = pReader.bsp(tNumberOfBits);
    }

    if (tGeneralLineFlag === 1 || tVerticalLineFlag === 1) {
      tDeltaY = pReader.bsp(tNumberOfBits);
    }

    return new EdgeRecord(3, tDeltaX, tDeltaY, 0, 0);
  }

  function parseCurvedEdge(pReader) {
    var tNumberOfBits = pReader.bp(4) + 2;
    var tDeltaControlX = pReader.bsp(tNumberOfBits);
    var tDeltaControlY = pReader.bsp(tNumberOfBits);
    var tDeltaX = pReader.bsp(tNumberOfBits);
    var tDeltaY = pReader.bsp(tNumberOfBits);
    return new EdgeRecord(2, tDeltaX, tDeltaY, tDeltaControlX, tDeltaControlY);
  }

  function parseStyleChanged(pReader, pNumberOfFillBits, pNumberOfLineBits, pWithAlpha, pIsMorph) {
    var tNewStyles = pReader.bp(1);
    var tNewLineStyle = pReader.bp(1);
    var tNewFillStyle1 = pReader.bp(1);
    var tNewFillStyle0 = pReader.bp(1);
    var tNewMoveTo = pReader.bp(1);

    var tResult = new StyleChangeRecord(pNumberOfFillBits, pNumberOfLineBits);

    if (tNewMoveTo === 1) {
      var tMoveBits = pReader.bp(5);
      tResult.hasMove = true;
      tResult.moveDeltaX = pReader.bsp(tMoveBits);
      tResult.moveDeltaY = pReader.bsp(tMoveBits);
    }

    if (tNewFillStyle0 === 1) {
      tResult.fillStyle0 = pReader.bp(pNumberOfFillBits);
    }

    if (tNewFillStyle1 === 1) {
      tResult.fillStyle1 = pReader.bp(pNumberOfFillBits);
    }

    if (tNewLineStyle === 1) {
      tResult.lineStyle = pReader.bp(pNumberOfLineBits);
    }

    if (tNewStyles === 1) {
      pReader.a();
      tResult.fillStyles = FillStyle.loadMultiple(pReader, pWithAlpha, true, pIsMorph);
      tResult.lineStyles = LineStyle.loadMultiple(pReader, pWithAlpha, true, pIsMorph);
      pReader.a();
      tResult.fillBits = pReader.bp(4);
      tResult.lineBits = pReader.bp(4);
    }

    return tResult;
  }

}(this));
