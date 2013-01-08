/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.CLIPACTIONS = CLIPACTIONS;

  /**
   * @constructor
   * @class {quickswf.structs.CLIPACTIONS}
   */
  function CLIPACTIONS() {
    this.allEventFlags = 0;
    this.clipActionRecords = new Array();
  }

  /**
   * Loads a CLIPACTIONS type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {number} pVersion The version of this SWF.
   * @return {quickswf.structs.CLIPACTIONS} The loaded CLIPACTIONS.
   */
  CLIPACTIONS.load = function(pReader, pVersion) {
    var tActions = new CLIPACTIONS();

    pReader.I16(); // Reserved for nothing.

    if (pVersion <= 5) {
      tActions.allEventFlags = pReader.I16();
    } else {
      tActions.allEventFlags = pReader.I32();
    }

    for (;;) {
      if (pVersion <= 5) {
        if (pReader.bp(16) === 0) {
          break;
        } else {
          pReader.a();
          pReader.seek(-2); // wind backwards.
        }
      } else {
        if (pReader.bp(32) === 0) {
          break;
        } else {
          pReader.a();
          pReader.seek(-4); // wind backwards.
        }
      }

      var tEventFlags;
      if (pVersion <= 5) {
        tEventFlags = pReader.bp(16);
      } else {
        tEventFlags = pReader.bp(32);
      }
      var tActionRecordSize = pReader.bp(32);
      pReader.a();
      // skip the actions for now.
      pReader.seek(tActionRecordSize);

      tActions.clipActionRecords.push({eventFlags: tEventFlags});
    }

    pReader.a();

    return tActions;
  };

}(this));

