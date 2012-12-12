/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['12'] = doAction;

  var Conv = global.quickswf.utils.Conv;
  var mStrId = 0;
  var MAX_ASYNC_STRING_NUM = (1 << 16);

  function doAction(pLength) {
    var tReader = this.r;
    var tData = tReader.sub(tReader.tell(), pLength);
    tData = parseAndMark(this.swf, tData);
    this.add({
      type: 'script',
      script: tData
    });
    tReader.seek(pLength);
  }

  /**
   * In order to convert Shift-JIS string literals in ActionScript bytecode,
   *  here we parse the bytecode, trigger the conversion if we encounter any Shit-JIS string,
   *  and manipulate the buffer to mark with a special literal type
   *  for letting VM know that the string is already converted.
   *  We do it here because the string is converted asynchronously.
   *
   * @param {quickswf.SWF} pSWF SWF object.
   * @param {Uint8Array} pBuffer AS bytecode.
   * @return {Uint8Array} AS bytecode which might be modified.
   */
  function parseAndMark(pSWF, pBuffer) {

    var tReader = new global.Breader(pBuffer),
        tBuffer = pBuffer,
        tActionCode, tLength, tType, tAsyncStr = pSWF.asyncStr,
        tBaseOffset, tLengthOffset, tLen, tArray;

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
      tType = tReader.B();
      if (tType !== 0) {
        tReader.seek(tLength - 1);
        continue;
      }

      // Also skip the string literals other than Shit-JIS.
      if (tReader.s(true) !== null) {
        // The string is not used and later the same string is going to be parsed again.
        // This sounds inefficient, but we want to avoid frequent array-truncation as well.
        continue;
      }
      tBaseOffset = tReader.tell() - 1; // To be used for overwriting the literal type.
      tLengthOffset = tBaseOffset - 2; // To be used for overwriting the length field.

      // Make a request to convert Shit-JIS to UCS.
      tLen = Math.min(tReader.sl(), tLength - 2);
      tArray = tReader.sub(tReader.tell(), tLen);
      tReader.seek(tLen + 1);
      (function (pStrId, pArray) {
          tAsyncStr[pStrId + ''] = {
              id: pStrId,
              data: null,
              complete: false
            };
          Conv(pArray, 'Shift_JIS', function(str){
              tAsyncStr[pStrId + ''].data = str;
              tAsyncStr[pStrId + ''].complete = true;
            });
        })(mStrId, tArray);


      // Overwrite the literal type.
      tBuffer[tBaseOffset++] = 255;

      // Truncate the buffer, using two bytes to store the id.
      //global.Array.prototype.splice.call(pBuffer, tBaseOffset, tLen + 1, mStrId & 0xFF, (mStrId >>> 8) & 0xFF);
      var tTrancateAndInsertInt16 = function (pTypedArray, pStart, pDeleteCount, pInt16Value) {
        var tLength = pTypedArray.length;
        var tNewBuffer = new Uint8Array(tLength - pDeleteCount + 2);
        var tView = new DataView(tNewBuffer.buffer);
        var tLeft   = pTypedArray.subarray(0, pStart);
        var tRight  = pTypedArray.subarray(pStart + pDeleteCount, tLength - pDeleteCount);

        tNewBuffer.set(tLeft); 
        tView.setUint16(pStart, pInt16Value, true);
        tNewBuffer.set(tRight, pStart + 2); 

        return tNewBuffer;
      };
      tBuffer = tTrancateAndInsertInt16(tBuffer, tBaseOffset, tLen + 1, mStrId);
      tReader = new global.Breader(tBuffer);
      tReader.seekTo(tBaseOffset + 2);

      // Overwrite the length field (2 bytes.)
      tBuffer[tLengthOffset++] = 3;
      tBuffer[tLengthOffset] = 0;

      if(++mStrId >= MAX_ASYNC_STRING_NUM) {
        throw new Error('Reached maximum string literals: ' + mStrId);
      }
    }
    return tBuffer;
  }

}(this));
