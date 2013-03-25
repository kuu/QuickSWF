/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var mStructs = global.quickswf.structs;
  mStructs.FILLSTYLE = FILLSTYLE;
  var RGBA = mStructs.RGBA;
  var MATRIX = mStructs.MATRIX;
  var GRADIENT = mStructs.GRADIENT;

  /**
   * @constructor
   * @class {quickswf.structs.FILLSTYLE}
   */
  function FILLSTYLE(pIsMorph) {
    if (pIsMorph) {
      this.type = 0;
      this.startColor = null;
      this.endColor = null;
      this.startMatrix = null;
      this.endMatrix = null;
      this.gradient = null;
      this.bitmapId = null;
    } else {
      this.type = 0;
      this.color = null;
      this.matrix = null;
      this.gradient = null;
      this.bitmapId = null;
    }
  }

  /**
   * Loads a FILLSTYLE type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @param {bool} pIsMorph True if morph shape.
   * @return {quickswf.structs.FILLSTYLE} The loaded FILLSTYLE.
   */
  FILLSTYLE.load = function(pReader, pWithAlpha, pIsMorph) {
    var tFillStyle = new FILLSTYLE(pIsMorph);
    var tType = tFillStyle.type = pReader.B();

    switch (tType) {
      case 0x00: // Solid fill
        if (pIsMorph) {
          tFillStyle.startColor = RGBA.load(pReader, pWithAlpha);
          tFillStyle.endColor = RGBA.load(pReader, pWithAlpha);
        } else {
          tFillStyle.color = RGBA.load(pReader, pWithAlpha);
        }
        break;
      case 0x10: // Linear gradient fill
      case 0x12: // Radial gradient fill
      case 0x13: // Focal radial gradient fill
        if (pIsMorph) {
          tFillStyle.startMatrix = MATRIX.load(pReader);
          tFillStyle.endMatrix = MATRIX.load(pReader);
        } else {
          tFillStyle.matrix = MATRIX.load(pReader);
        }
        tFillStyle.gradient = GRADIENT.load(pReader, pWithAlpha, pIsMorph);
        if (tType === 0x13) {
          tFillStyle.gradient.focalPoint = pReader.fpb8p(16);
        }
        break;
      case 0x40: // Repeating bitmap fill
      case 0x41: // Clipped bitmap fill
      case 0x42: // Non-smoothed repeating bitmap
      case 0x43: // Non-smoothed clipped bitmap
        tFillStyle.bitmapId = pReader.I16();
        if (pIsMorph) {
            tFillStyle.startMatrix = MATRIX.load(pReader);
            tFillStyle.endMatrix = MATRIX.load(pReader);
        } else {
            tFillStyle.matrix = MATRIX.load(pReader);
        }
        if (tFillStyle.bitmapId === 0xFFFF) {
          tFillStyle.color = 'rgba(255, 0, 0, 1)';
          tFillStyle.type = 0;
          if (pIsMorph) {
            tFillStyle.startMatrix = null;
            tFillStyle.endMatrix = null;
          } else {
            tFillStyle.matrix = null;
          }
          tFillStyle.bitmapId = null;
          break;
        }

        if (tType === 0x42 || tType === 0x43) {
          console.warn('Non-smoothed bitmaps are not supported');
        }

        break;
      default:
        console.error('Unknown fill style type: ' + tType);
        return;
    }

    return tFillStyle;
  };

  /**
   * Loads an array of FILLSTYLE types.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if alpha needs to be parsed.
   * @param {bool} pHasLargeFillCount True if this struct can have more than 256 styles.
   * @param {bool} pIsMorph True if morph shape.
   * @return {Array.<quickswf.structs.FILLSTYLE>} The loaded FILLSTYLE array.
   */
  FILLSTYLE.loadMultiple = function(pReader, pWithAlpha, pHasLargeFillCount, pIsMorph) {
    var tCount = pReader.B();

    if (pHasLargeFillCount && tCount === 0xFF) {
      tCount = pReader.I16();
    }

    var tArray = new Array(tCount);

    for (var i = 0; i < tCount; i++) {
        tArray[i] = FILLSTYLE.load(pReader, pWithAlpha, pIsMorph);
    }

    return tArray;
  };

}(this));
