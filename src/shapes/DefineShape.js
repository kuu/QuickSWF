/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['2'] = defineShape;
  global.quickswf.Parser.prototype['22'] = defineShape2;
  global.quickswf.Parser.prototype['32'] = defineShape3;

  var mStructs = global.quickswf.structs;
  mStructs.Shape = Shape;

  var RECT = mStructs.RECT;
  var FILLSTYLE = mStructs.FILLSTYLE;
  var LINESTYLE = mStructs.LINESTYLE;
  var SHAPERECORD = mStructs.SHAPERECORD;

  /**
   * @constructor
   * @class {quickswf.structs.Shape}
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

  Shape.prototype.displayListType = 'DefineShape';

  /**
   * Loads a Shape type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithStyles True if styles need to parsed.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @param {bool} pHasLargeFillCount True if this struct can have more than 256 styles.
   * @return {quickswf.structs.Shape} The loaded Shape.
   */
  Shape.load = function(pReader, pWithStyles, pWithAlpha, pHasLargeFillCount) {
    var tShape = new Shape();

    if (pWithStyles) {
      tShape.fillStyles = FILLSTYLE.loadMultiple(pReader, pWithAlpha, pHasLargeFillCount, false);
      tShape.lineStyles = LINESTYLE.loadMultiple(pReader, pWithAlpha, pHasLargeFillCount, false);
    } else {
      tShape.fillStyles = [new FILLSTYLE(false)];
      tShape.lineStyles = [new LINESTYLE(false)];
    }
    tShape.numberOfFillBits = pReader.bp(4);
    tShape.numberOfLineBits = pReader.bp(4);
    tShape.records = SHAPERECORD.loadMultiple(pReader, tShape, pWithAlpha);

    return tShape;
  };

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
    var tBounds = RECT.load(tReader);
    var tShape = Shape.load(tReader, true, pWithAlpha, pHasLargeFillCount);

    tShape.id = tId;
    tShape.bounds = tBounds;

    pParser.swf.dictionary[tId + ''] = tShape;
  }


}(this));
