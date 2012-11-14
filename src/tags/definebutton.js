/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['7'] = defineButton;
  global.quickswf.Parser.prototype['34'] = defineButton2;

  var Button = global.quickswf.structs.Button;
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

    // ActionScript
    var tStart = tReader.tell();
    var tButtonAction = tReader.sub(tStart, tBounds - tStart)
    tReader.seekTo(tBounds);

    // Store the button records to the dictionary.
    var tCondAction = new ButtonCondAction(null, tButtonAction);
    this.swf.dictionary[tId + ''] = new Button(tButtonRecords, [tCondAction], false);
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

    // Condition + ActionScript
    var tButtonActions = new Array();
    if (tActionOffset > 0) {
      var tLast, tCondAction;
      do {
        tLast = tReader.peekBits(16) === 0;
        tCondAction = ButtonCondAction.load(tReader, tBounds);
        tButtonActions.push(tCondAction);
      } while (!tLast);
    }
    // Store the button records to the dictionary.
    this.swf.dictionary[tId + ''] = new Button(tButtonRecords, tButtonActions, tTrackAsMenu);
  }

}(this));
