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
        tLiteralTypeOffset, tUint8Array, tBase64String,
        tString, tStringLength, tReadLength;

    while ((tActionCode = tReader.B()) !== 0) {
      // We are only interested in ActionPush (type=0, string literal)
      // So, just skip the others.
      if (tActionCode < 0x80) {
        continue;
      }
      tLength = tReader.I16();
      if (tActionCode !== 0x96) {
        tReader.seek(tLength);
        continue;
      }
      tLength--; // Minus 1 byte for the action code.
      if (tReader.B() !== 0) { // Type (0 : String)
        tReader.seek(tLength);
        continue;
      }

      // Looping here because the string can be null-terminated in the middle.
      tReadLength = 0;
      while (tReadLength < tLength) {
        // Skip the string literals other than Shift-JIS.
        //if (tReader.s(true, pParser.nonUtf8CharDetected) !== null) {
        tStringLength = tReader.sl();
        tString = tReader.s(true, pParser.nonUtf8CharDetected);
        if (tString !== null) {
          // Utf8 char:
          // The string is not used and later the same string is going to be parsed again.
          // This sounds inefficient, but we want to avoid storing and searching a lot of strings.
        } else {
          // Non-Utf8 char:
          // Make a request to convert Shift-JIS to UCS.
          pParser.nonUtf8CharDetected = true;
          tLiteralTypeOffset = tReader.tell() - 1;
          tUint8Array = tReader.sub(tReader.tell(), tStringLength);
          tBase64String = global.btoa(global.String.fromCharCode.apply(null, tUint8Array));
          tReader.seek(tStringLength + 1);
          tSWF.mediaLoader.load(tBase64String, tUint8Array, 'text/plain; charset=Shift_JIS');
          pBuffer[tLiteralTypeOffset] = 255; // Overwrite the literal type.
        }
        tReadLength += (tStringLength + 1);
      }
    }
  }

}(this));
