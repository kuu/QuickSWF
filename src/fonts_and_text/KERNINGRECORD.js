/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 Yoshihiro Yamazaki
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.KERNINGRECORD = KERNINGRECORD;

  /**
   * @constructor
   * @class {quickswf.structs.KERNINGRECORD}
   */
  function KERNINGRECORD(pCode1, pCode2, pAdjustment) {
    this.code1 = pCode1;
    this.code2 = pCode2;
    this.adjustment = pAdjustment;
  }

  /**
   * Loads a KERNINGRECORD type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.KERNINGRECORD} The loaded KERNINGRECORD.
   */
  KERNINGRECORD.load = function(pReader, pFlagWideCodes) {
    var tCode1, tCode2, tAdjustment;
    if(pFlagWideCodes) {
      tCode1 = pReader.I16();
      tCode2 = pReader.I16();
    } else {
      tCode1 = pReader.B();
      tCode2 = pReader.B();
    }
    tAdjustment = pReader.I16();
    return new KERNINGRECORD(tCode1, tCode2, tAdjustment);
  };

}(this));
