/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['12'] = doAction;
  global.quickswf.Parser.parseAndMark = parseAndMark;

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
        tStringLength, tStartIndex, tType;

    while ((tActionCode = tReader.B()) !== 0) {
      // We are only interested in ActionPush (type=0, string literal)
      // So, just skip the others.
      if (tActionCode < 0x80) {
        continue;
      }
      tLength = tReader.I16();

      // Skip the actions other than Push.
      if (tActionCode !== 0x96) {
        tReader.seek(tLength);
        continue;
      }

      // ActionPush

      tStartIndex = tReader.tell();

      while (tReader.tell() - tStartIndex < tLength) {
        tType = tReader.B();
        switch (tType) {
        case 0: // String literal
          // Shift-JIS -> UCS conversion.
          if (tReader.s(true, pParser.nonUtf8CharDetected) !== null) {
            // Utf8 char:
            // The string is not used and later the same string is going to be parsed again.
            // This sounds inefficient, but we want to avoid storing and searching a lot of strings.
          } else {
            // Non-Utf8 char:
            // Make a request to convert Shift-JIS to UCS.
            pParser.nonUtf8CharDetected = true;
            tLiteralTypeOffset = tReader.tell() - 1;
            tStringLength = tReader.sl();
            tUint8Array = tReader.sub(tReader.tell(), tStringLength);
            tBase64String = global.btoa(global.String.fromCharCode.apply(null, global.Array.prototype.slice.call(tUint8Array, 0)));
            tReader.seek(tStringLength + 1);
            tSWF.mediaLoader.load(tBase64String, tUint8Array, 'text/plain; charset=Shift_JIS');
            pBuffer[tLiteralTypeOffset] = 255; // Overwrite the literal type.
          }
          break;
        case 1: // Floating Point literal
          tReader.F32();
          break;
        case 4: // Register Number
          tReader.B();
          break;
        case 5: // Boolean
          tReader.B() ? true : false;
          break;
        case 6: // Double
          tReader.F64();
          break;
        case 7: // Integer
          tReader.I32();
          break;
        case 8: // Constant8: For constant pool index < 256
          tReader.B();
          break;
        case 9: // Constant16: For constant pool index >= 256
          tReader.I16();
          break;
        default:
          console.warn('[ActionPush] ---- Unknown data type. ----');
          break;
        }
      }
    }
  }

}(this));
