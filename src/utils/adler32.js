/**
 * @author Yuta Imaya
 * @author Jason Parrott (Namespace modifications)
 *
 * Copyright (C) 2013 SWFCrew Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

//-----------------------------------------------------------------------------
// Code copied from zlib.js at https://github.com/imaya/zlib.js
// with permission from author.
//-----------------------------------------------------------------------------


(function(global) {

  global.quickswf.utils.Adler32 = Adler32;

  /**
   * Adler32 ハッシュ値の作成
   * @param {!(Array|Uint8Array|string)} array 算出に使用する byte array.
   * @return {number} Adler32 ハッシュ値.
   */
  function Adler32(array) {
    if (typeof(array) === 'string') {
      array = Zlib.Util.stringToByteArray(array);
    }
    return Adler32.update(1, array);
  };

  /**
   * Adler32 ハッシュ値の更新
   * @param {number} adler 現在のハッシュ値.
   * @param {!(Array|Uint8Array)} array 更新に使用する byte array.
   * @return {number} Adler32 ハッシュ値.
   */
  Adler32.update = function(adler, array) {
    /** @type {number} */
    var s1 = adler & 0xffff;
    /** @type {number} */
    var s2 = (adler >>> 16) & 0xffff;
    /** @type {number} array length */
    var len = array.length;
    /** @type {number} loop length (don't overflow) */
    var tlen;
    /** @type {number} array index */
    var i = 0;

    while (len > 0) {
      tlen = len > Adler32.OptimizationParameter ?
        Adler32.OptimizationParameter : len;
      len -= tlen;
      do {
        s1 += array[i++];
        s2 += s1;
      } while (--tlen);

      s1 %= 65521;
      s2 %= 65521;
    }

    return ((s2 << 16) | s1) >>> 0;
  };

  /**
   * Adler32 最適化パラメータ
   * 現状では 1024 程度が最適.
   * @see http://jsperf.com/adler-32-simple-vs-optimized/3
   * @const
   * @type {number}
   */
  Adler32.OptimizationParameter = 1024;

}(this));