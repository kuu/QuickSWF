/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['7'] = defineButton;
  global.quickswf.Parser.prototype['34'] = defineButton2;

  var MATRIX = global.quickswf.structs.MATRIX;
  var CXFORM = global.quickswf.structs.CXFORM;

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

  Button.prototype.displayListType = 'DefineButton';

  /**
   * @constructor
   * @class {quickswf.structs.BUTTONRECORD}
   */
  function BUTTONRECORD(pId, pDepth, pMatrix, pStates, pCx, pFl, pBm) {
    this.id = pId;
    this.depth = pDepth;
    this.matrix = pMatrix;
    this.colorTransform = pCx;
    this.filterList = pFl;
    this.blendMode = pBm;
    this.state = {
        hitTest : (pStates >> 3) & 0x1,
        down    : (pStates >> 2) & 0x1,
        over    : (pStates >> 1) & 0x1,
        up      : (pStates >> 0) & 0x1
      };
  }


  /**
   * Loads a BUTTONRECORD type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.BUTTONRECORD} The loaded BUTTONRECORD.
   */
  BUTTONRECORD.load = function(pReader, pWithinDB2) {
    var tFlags  = pReader.B();
    var tId     = pReader.I16();
    var tDepth  = pReader.I16();
    var tMatrix = MATRIX.load(pReader);
    var tButtonStates = tFlags & 0xf;
    var tColorTransform = null;
    var tHasBlendMode  = (tFlags >> 5) & 0x1;
    var tHasFilterList = (tFlags >> 4) & 0x1;
    var i, tFilterNum, tFilterId, tBytesToSkip;

    if (pWithinDB2) {
      tColorTransform = CXFORM.load(pReader, true);
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
    return new BUTTONRECORD(tId, tDepth, tMatrix, tButtonStates,
                tColorTransform, null, null);
  };

  /**
   * @constructor
   * @class {quickswf.structs.BUTTONCONDACTION}
   */
  function BUTTONCONDACTION(pCond, pAction) {
    this.cond = pCond;
    this.action = pAction;
  }


  /**
   * Loads a BUTTONCONDACTION type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.BUTTONCONDACTION} The loaded BUTTONCONDACTION.
   */
  BUTTONCONDACTION.load = function(pReader, pBounds) {
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

    return new BUTTONCONDACTION(tCond, tButtonAction);
  };

  function defineButton(pLength) {
    var tReader = this.r;
    var tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();

    // Parse button records. (n >= 1)
    var tButtonRecords = new Array();
    do {
      tButtonRecords.push(BUTTONRECORD.load(tReader, false));
    } while (tReader.peekBits(8));
    tReader.B(); // Last one byte

    // ActionScript
    var tStart = tReader.tell();
    var tButtonAction = tReader.sub(tStart, tBounds - tStart)
    tReader.seekTo(tBounds);

    // Store the button records to the dictionary.
    var tCondAction = new BUTTONCONDACTION(null, tButtonAction);
    this.swf.dictionary[tId + ''] = new Button(tId, tButtonRecords, [tCondAction], false);
  }

  function defineButton2(pLength) {
    var tReader = this.r;
    var tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();
    var tFlags  = tReader.B();
    var tTrackAsMenu = tFlags & 1;
    var tActionOffset = tReader.I16();

    if (tActionOffset > 3 || tActionOffset === 0) {
      // Parse button records. (n >= 1)
      var tButtonRecords = new Array();
      do {
        tButtonRecords.push(BUTTONRECORD.load(tReader, true));
      } while (tReader.peekBits(8));
    }
    tReader.B(); // Last one byte

    // Condition + ActionScript
    var tButtonActions = new Array();
    if (tActionOffset > 0) {
      var tLast, tCondAction;
      do {
        tLast = tReader.peekBits(16) === 0;
        tCondAction = BUTTONCONDACTION.load(tReader, tBounds);
        tButtonActions.push(tCondAction);
      } while (!tLast);
    }
    // Store the button records to the dictionary.
    this.swf.dictionary[tId + ''] = new Button(tId, tButtonRecords, tButtonActions, tTrackAsMenu);
  }

}(this));
