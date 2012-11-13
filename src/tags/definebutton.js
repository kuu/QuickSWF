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

  function defineButton(pLength) {
console.log('defineButton');
    var tReader = this.r;
    var tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();
    var tButtonRecords = new Array();
    do {
      tButtonRecords.push(ButtonRecord.load(tReader, false));
    } while (tReader.peekBits(8));

    // Skip the button actions for now.   
    tReader.seekTo(tBounds);

    // Store the button records.
    this.swf.buttonRecords[tId + ''] = tButtonRecords;

    // Add the button to Display Object.
    this.add({
      type: 'button',
      id: tId
    });
  }

  function defineButton2(pLength) {
console.log('defineButton2');
    var tReader = this.r;
    var tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();
    var tFlags  = tReader.B();
    var tTrackAsMenu = tFlags & 1;
    var tActionOffset = tReader.I16();
    var tButtonRecords = new Array();
    do {
      tButtonRecords.push(ButtonRecord.load(tReader, true));
    } while (tReader.peekBits(8));

    // Skip the button actions for now.   
    tReader.seekTo(tBounds);

    // Store the button records.
    this.swf.buttonRecords[tId + ''] = tButtonRecords;

    // Add the button to Display Object.
    this.add({
      type: 'button',
      id: tId,
      trackAsMenu: tTrackAsMenu
    });
  }

}(this));
