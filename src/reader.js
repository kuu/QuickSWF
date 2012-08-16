(function(global) {

  global.quicktheatre.Reader = Reader;

  /**
   * @constructor
   */
  function Reader(pBuffer) {
    /**
     * The pointer to the current index of the buffer.
     * @type {Number}
     * @private
     */
    this.i = 0;

    /**
     * The current bit buffer.
     * @type {Number}
     * @private
     */
    this.bb = 0;

    /**
     * The current bit buffer length;
     * @type {Number}
     * @private
     */
    this.bbl = 0;

    /**
     * The buffer to read from.
     * @private
     */
    this.b = pBuffer;

    /**
     * The size of the buffer.
     * Can be changed to simulate trimming.
     * @type {Number}
     */
    this.fileSize = pBuffer.length;
  }

  Reader.prototype = /** @lends {quicktheatre.Reader#} */ {

    /**
     * Align the current bits to the nearest large byte.
     */
    a: function() {
      if (this.bbl !== 0) {
        //this.i += ((this.bbl + 7) >>> 3) | 0;
        this.bb = 0;
        this.bbl = 0;
      }
    },

    /**
     * Seeks the given offset in the buffer.
     * @param {Number} pOffset The offset to seek.
     */
    seek: function(pOffset) {
      this.a();
      this.i += pOffset;
    },

    /**
     * Seeks to the given index in the buffer.
     * @param {Number} pIndex The index to seek to.
     */
    seekTo: function(pIndex) {
      this.a();
      this.i = pIndex;
    },

    /**
     * Gets the current position of the index in the buffer.
     * @return {Number} The index.
     */
    tell: function() {
      return this.i;
    },

    /**
     * Reads bits.
     * @param {Number} pNumber The number of bits to read.
     * @return {Number} The bits.
     */
    bp: function(pNumber) {
      var tBuffer = this.b,
          tByteIndex = this.i,
          tBitBuffer = this.bb,
          tBitBufferLength = this.bbl;

      var tTmp = 0;

      while (tBitBufferLength < pNumber) {
        tTmp = tBuffer[tByteIndex++];
        tBitBuffer = (tBitBuffer << 8) | tTmp;
        tBitBufferLength += 8;
      }

      tTmp = tBitBuffer >>> (tBitBufferLength - pNumber);
      tBitBuffer &= (((1 << tBitBufferLength) - 1) & ((1 << (tBitBufferLength - pNumber)) - 1));
      tBitBuffer << pNumber;
      tBitBufferLength -= pNumber;

      this.bb = tBitBuffer;
      this.bbl = tBitBufferLength;
      this.i = tByteIndex;

      return tTmp;
    },

    /**
     * Reads a fixed point from bits.
     * @param {Number} pNumber The number of bits to read.
     * @return {Number} The fixed point.
     */
    fpbp: function(pNumber) {
      return this.bsp(pNumber) * 0.0000152587890625;
    },

    /**
     * Reads a signed number from bits.
     * @param {Number} pNumber The number of bits to read.
     * @return {Number} The bits.
     */
    bsp: function(pNumber) {
      var tResult = this.bp(pNumber);
      if (tResult >> (pNumber - 1)) {
        tResult -= 1 << pNumber;
      }
      return tResult;
    },

    /**
     * Reads one byte.
     * @return {Number} The byte.
     */
    B: function() {
      return this.b[this.i++];
    },

    /**
     * Reads a two byte unsigned integer.
     * @return {Number} The number.
     */
    I16: function() {
      var tBuffer = this.b,
          tIndex = this.i;
      var tResult = (tBuffer[tIndex]) | (tBuffer[tIndex + 1] << 8);
      this.i += 2;
      return tResult;
    },

    /**
     * Reads a 4 byte unsigned integer.
     * @return {Number} The number.
     */
    I32: function() {
      /**
       * @type {Uint8Array}
       */
      var tBuffer = this.b;

      /**
       * @type {Number}
       */
      var tIndex = this.i;

      /**
       * @type {Number}
       */
      var tResult =
        ((tBuffer[tIndex + 3] << 24) >>> 0) |
        (tBuffer[tIndex + 2] << 16) |
        (tBuffer[tIndex + 1] << 8) |
        tBuffer[tIndex];
      this.i += 4;
      return tResult;
    },

    /**
     * Reads a 4 byte signed integer.
     * @return {Number} The number.
     */
    SI32: function() {
      /**
       * @type {Uint8Array}
       */
      var tBuffer = this.b;

      /**
       * @type {Number}
       */
      var tIndex = this.i;

      /**
       * @type {Number}
       */
      var tResult =
        (tBuffer[tIndex + 3] << 24) |
        (tBuffer[tIndex + 2] << 16) |
        (tBuffer[tIndex + 1] << 8) |
        tBuffer[tIndex];
      this.i += 4;
      return tResult;
    },

    /**
     * Reads a single character.
     * @return {String} The character.
     */
    c: function() {
      return String.fromCharCode(this.b[this.i++]);
    },

    /**
     * Reads a string until a null character is found.
     * @return {String} The string.
     */
    s: function() {
      var tString = '';
      var tBuffer = this.b;
      var i = this.i;
      var tChar = 0;
      for (; ; i++) {
        tChar = tBuffer[i];
        if (tChar === 0) {
          break;
        }
        tString += String.fromCharCode(tChar);
      }
      this.i = i;
      return tString;
    },

    /**
     * Reads a string in ascii encoding.
     * @param {Number} pLength The length of the string to read.
     * @return {String} The string.
     */
    sp: function(pLength) {
      var tString = '';
      var tBuffer = this.b;
      var i = this.i;
      pLength += i;
      for (; i < pLength; i++) {
        tString += String.fromCharCode(tBuffer[i]);
      }
      this.i = i;
      return tString;
    }

  };

}(this));
