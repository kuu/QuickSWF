/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var structs = global.quickswf.structs;

  structs.Button = Button;
  structs.ButtonRecord = ButtonRecord;
  structs.ButtonCondAction = ButtonCondAction;

  /**
   * @constructor
   * @class {quickswf.structs.Button}
   */
  function Button(pId, pRecordList, pCondActionList, pTrackAsMenu) {
    this.id = pId;
    this.records = pRecordList;
    this.condActions = pCondActionList;
    this.isMenu = pTrackAsMenu;
  }

  Button.prototype.displayListType = 3;

  /**
   * @constructor
   * @class {quickswf.structs.ButtonRecord}
   */
  function ButtonRecord(pId, pDepth, pMatrix, pStates, pCx, pFl, pBm) {
    this.id = pId;
    this.depth = pDepth;
    this.matrix = pMatrix;
    this.colorTransform = pCx;
    this.filterList = pFl;
    this.blendMode = pBm;
    this.isHit  = (pStates >> 3) & 0x1;
    this.isDown = (pStates >> 2) & 0x1;
    this.isOver = (pStates >> 1) & 0x1;
    this.isUp   = (pStates >> 0) & 0x1;
  }


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
    var tHasBlendMode  = (tFlags >> 5) & 0x1;
    var tHasFilterList = (tFlags >> 4) & 0x1;
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

  /**
   * @constructor
   * @class {quickswf.structs.ButtonCondAction}
   */
  function ButtonCondAction(pCond, pAction) {
    this.cond = pCond;
    this.action = pAction;
  }


  /**
   * Loads a ButtonCondAction type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.ButtonCondAction} The loaded ButtonCondAction.
   */
  ButtonCondAction.load = function(pReader, pBounds) {
    var tSize = pReader.I16();
    var tFlags = pReader.I16();
    var tLength = tSize ? tSize - 4 : pBounds - pReader.tell();
    var tButtonAction = pReader.sub(pReader.tell(), tLength);
    pReader.seek(tLength);

    var tCond = {
        idleToOverDown    : (tFlags >>  7) & 0x1,
        outDownToIdle     : (tFlags >>  6) & 0x1,
        outDownToOverDown : (tFlags >>  5) & 0x1,
        overDownToOutDown : (tFlags >>  4) & 0x1,
        overDownToOverUp  : (tFlags >>  3) & 0x1,
        overUpToOverDown  : (tFlags >>  2) & 0x1,
        overUpToIdle      : (tFlags >>  1) & 0x1,
        idleToOverUp      : (tFlags >>  0) & 0x1,
        keyPress          : (tFlags >>  9) & 0x7f,
        overDownToIdle    : (tFlags >>  8) & 0x1
      };

    return new ButtonCondAction(tCond, tButtonAction);
  };

}(this));
