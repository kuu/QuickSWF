/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.ActionRecord = ActionRecord;

  /**
   * @constructor
   * @class {quickswf.structs.ActionRecord}
   */
  function ActionRecord(pActionCode) {
    this.code = pActionCode;
  }

  /**
   * Loads a ActionRecord type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.ActionRecord} The loaded ActionRecord.
   */
  ActionRecord.load = function(pReader) {
    var tActionCode = pReader.B();
    var tActionRecord = new ActionRecord(tActionCode);

    if (tActionCode < 0x80) {
      return tActionRecord;
    }

    var tLength = pReader.I16();

    switch (tActionCode) {
    case 0x81:
      tActionRecord.frame = pReader.I16();
      break;
    case 0x83:
      tActionRecord.url = pReader.s();
      tActionRecord.target = pReader.s();
      break;
    case 0x8a:
      tActionRecord.frame = pReader.I16();
      tActionRecord.skip = pReader.I16();
      break;
    case 0x8b:
      tActionRecord.target = pReader.s();
      break;
    case 0x8c:
      tActionRecord.label = pReader.s();
      break;
    default:
      // Skip
      console.log('[quickswf.parser] Unknown action code: ' + tActionCode);
      pReader.seek(tLength);
    }
    return  tActionRecord;
  };

}(this));
