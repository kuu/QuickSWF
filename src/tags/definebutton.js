/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['7'] = defineButton;
  global.quickswf.Parser.prototype['34'] = defineButton2;

  var ButtonRecord = global.quickswf.structs.ButtonRecord;
  var ActionRecord = global.quickswf.structs.ActionRecord;
  var ButtonCondAction = global.quickswf.structs.ButtonCondAction;

  function defineButton(pLength) {
console.log('defineButton');
    var tReader = this.r;
    var tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();

    // Parse button records. (n >= 1)
    var tButtonRecords = new Array();
    do {
      tButtonRecords.push(ButtonRecord.load(tReader, false));
    } while (tReader.peekBits(8));
    tReader.B(); // Last one byte

    // Store the button records to the dictionary.
    this.swf.dictionary[tId + ''] = tButtonRecords;

    // Parse button actions. (n >= 0)
    var tActionRecords = new Array();
    while (tReader.peekBits(8)) {
      tActionRecords.push(ActionRecord.load(tReader));
    }
    tReader.B(); // Last one byte

    // Store the button actions.
    this.swf.buttonActions[tId + ''] = new ButtonCondAction(null, tActionRecords);
  }

  function defineButton2(pLength) {
console.log('defineButton2');
    var tReader = this.r;
    var tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();
    var tFlags  = tReader.B();
    var tTrackAsMenu = tFlags & 1;
    var tActionOffset = tReader.I16();

    // Parse button records. (n >= 1)
    var tButtonRecords = new Array();
    do {
      tButtonRecords.push(ButtonRecord.load(tReader, true));
    } while (tReader.peekBits(8));
    tReader.B(); // Last one byte

    // Store the button records to the dictionary.
    this.swf.dictionary[tId + ''] = tButtonRecords;

    if (tActionOffset > 0) {
      // Parse button actions. (n >= 0)
      var tActionRecords = new Array(), tLast;
      do {
        tLast = tReader.peekBits(16) === 0;
        tActionRecords.push(ButtonCondAction.load(tReader));
      } while (!tLast);

      // Store the button actions.
      this.swf.buttonActions[tId + ''] = tActionRecords;
    }
  }

}(this));
