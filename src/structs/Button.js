/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var structs = global.quickswf.structs;

  structs.ButtonRecord = ButtonRecord;

  /**
   * @constructor
   * @class {quickswf.structs.ButtonRecord}
   */
  function ButtonRecord(pId, pDepth, pMatrix, pStates, pCx, pFl, pBm) {
    this.id = pId;
    this.depth = pDepth;
    this.matrix = pMatrix;
    this.state = pStates;
    this.colorTransform = pCx;
    this.filterList = pFl;
    this.blendMode = pBm;
  }

  ButtonRecord.prototype.isUp   = function () { return this.state & (1 << 0); };
  ButtonRecord.prototype.isOver = function () { return this.state & (1 << 1); };
  ButtonRecord.prototype.isDown = function () { return this.state & (1 << 2); };
  ButtonRecord.prototype.isHit  = function () { return this.state & (1 << 3); };

  /**
   * Loads a ButtonRecord type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.ButtonRecord} The loaded ButtonRecord.
   */
  ButtonRecord.load = function(pReader, pWithinDB2) {
    var tFlags  = pReader.B();
    var tId     = pReader.I16();
    var tDepth  = pReader.I16();
    var tMatrix = structs.Matrix.load(pReader);
    var tButtonStates = tFlags & 0xf;
    var tColorTransform = null;
    var tHasBlendMode  = tFlags & (1 << 4);
    var tHasFilterList = tFlags & (1 << 5);
    var i, tFilterNum, tFilterId, tBytesToSkip;

    if (pWithinDB2) {
      tColorTransform = structs.ColorTransform.load(pReader, true);
      if (tHasFilterList) {
        // Just skipping...
        tBytesToSkip = [23, 9, 15, 27, 25, 19, 80, 25];
        tFilterNum = pReader.B();
        for (i = 0; i < tFilterNum; i++) {
          tFilterId = pReader.B();
          pReader.seek(tBytesToSkip[tFilterID]);
        }
      }
      if (tHasBlendMode) {
        // Just skipping...
        pReader.seek(1);
      }
    }
    return new ButtonRecord(tId, tDepth, tMatrix, tButtonStates,
                tColorTransform, null, null);
  };

}(this));
