/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['12'] = doAction;

  var MAX_ASYNC_STRING_NUM = (1 << 16);

  function doAction(pLength) {
    var tReader = this.r;
    var tData = tReader.sub(tReader.tell(), pLength);
    parseAndMark(this, tData);
    this.add({
      type: 'script',
      script: tData
    });
    tReader.seek(pLength);
  }

  /**
   * In order to convert Shift-JIS string literals in ActionScript bytecode,
   *  here we parse the bytecode, trigger an async function to convert Shift-JIS string,
   *  and mark the SWF binary with a special literal type (255)
   *  for letting VM know that the string is already converted and stored in another place.
   *
   * @param {quickswf.Parser} pParser Parser object.
   * @param {Uint8Array} pBuffer AS bytecode.
   */
  function parseAndMark(pParser, pBuffer) {

    var tReader = new global.Breader(pBuffer),
        tActionCode, tLength, tSWF = pParser.swf,
        tLiteralTypeOffset, tUint8Array, tBase64String;

    while ((tActionCode = tReader.B()) !== 0) {
      // We are only interested in ActionPush (type=0, string literal)
      // So, just skip the others.
      if (tActionCode < 0x80) {
        if (tActionCode === 0x12) { // Not
          tReader.seek(1); // boolean
        }
        continue;
      }
      tLength = tReader.I16();
      if (tActionCode !== 0x96) {
        tReader.seek(tLength);
        continue;
      }
      if (tReader.B() !== 0) { // Type (0 : String)
        tReader.seek(tLength - 1);
        continue;
      }
      // Also skip the string literals other than Shift-JIS.
      if (tReader.s(true, pParser.nonUtf8CharDetected) !== null) {
        // The string is not used and later the same string is going to be parsed again.
        // This sounds inefficient, but we want to avoid storing and searching a lot of strings.
        continue;
      }
      pParser.nonUtf8CharDetected = true;
      tLiteralTypeOffset = tReader.tell() - 1;

      // Make a request to convert Shift-JIS to UCS.
      tLength = tReader.sl();
      tUint8Array = tReader.sub(tReader.tell(), tLength);
      tBase64String = global.btoa(global.String.fromCharCode.apply(null, tUint8Array));
      tReader.seek(tLength + 1);
      tSWF.mediaLoader.load(tBase64String, tUint8Array, 'text/plain; charset=Shift_JIS');
      // Overwrite the literal type.
      pBuffer[tLiteralTypeOffset] = 255;
    }
  }

}(this));
