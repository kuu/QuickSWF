/**
 * @author Yuta Imaya
 *
 * Copyright (C) 2012 Yuta Imaya.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  global.quickswf.Parser.prototype['20'] = defineBitsLossless;
  global.quickswf.Parser.prototype['36'] = defineBitsLossless2;

  var mNewBlob = global.quickswf.polyfills.newBlob;
  var mCreateImage = global.quickswf.polyfills.createImage;
  var mHaveTypedArray = global.quickswf.browser.HaveTypedArray;
  var mHaveAndroidAlphaBug = global.quickswf.browser.HavePutImageDataAlphaBug;
  var mHaveCreateObjectURL = global.quickswf.browser.HaveCreateObjectURL;

  /** @const @type {number} */
  var mBlockSize = 0xffff;

  /**
   * @this {quickswf.Parser}
   * @param {number} pLength tag length.
   */
  function defineBitsLossless(pLength) {
    /** @type {number} */
    var tId = this.r.I16();
    /** @type {Lossless} */
    var tLossless = new Lossless(this, pLength, false);

    tLossless.parse();

    if (tLossless.format === LosslessFormat.COLOR_MAPPED && mHaveCreateObjectURL) {
      this.swf.images[tId] = tLossless.getImage();
    } else {
      this.swf.images[tId] = tLossless.getCanvas();
    }
  }

  /**
   * @param {number} pLength tag length.
   */
  function defineBitsLossless2(pLength) {
    /** @type {number} */
    var tId = this.r.I16();
    /** @type {Lossless} */
    var tLossless = new Lossless(this, pLength, true);

    tLossless.parse();

    if (tLossless.format === LosslessFormat.COLOR_MAPPED && mHaveCreateObjectURL) {
      this.swf.images[tId] = tLossless.getImage();
    } else {
      this.swf.images[tId] = tLossless.getCanvas();
    }
  }

  /**
   * @enum {number}
   */
  var LosslessFormat = {
    COLOR_MAPPED: 3,
    RGB15: 4,
    RGB24: 5
  };

  /**
   * @enum {number}
   */
  var PngColourType = {
    GRAYSCALE: 0,
    TRUECOLOR: 2,
    INDEXED_COLOR: 3,
    GRAYSCALE_WITH_ALPHA: 4,
    TRUECOLOR_WITH_ALPHA: 6
  };

  /**
   * lossless image parser.
   * @param {quickswf.Parser} parser swf parser object.
   * @param {number} pLength tag length.
   * @param {boolean=} withAlpha alpha channel support flag.
   * @constructor
   */
  function Lossless(parser, pLength, withAlpha) {
    /** @type {Breader} */
    this.reader = parser.r;
    /** @type {number} */
    this.size = pLength - (2 + 1 + 2 + 2);
    /** @type {number} */
    this.width;
    /** @type {number} */
    this.height;
    /** @type {!(Array.<number>|Uint8Array)} */
    this.plain;
    /** @type {LosslessFormat} */
    this.format;
    /** @type {PngColourType} */
    this.colourType;
    /** @type {!(Array.<number>|Uint8Array)} */
    this.palette;
    /** @type {!Uint8Array} */
    this.png;
    /** @type {number} */
    this.pp = 0;
    /** @type {number} */
    this.withAlpha = withAlpha ? 1 : 0;

    if (withAlpha) {
      this.writeIDAT = this.writeIDATwithAlpha;
    }
  }

  /**
   * @return {number}
   */
  Lossless.prototype.calcBufferSize = function() {
    /** @type {number} */
    var size = 0;
    /** @type {number} */
    var pixelWidth;
    /** @type {number} */
    var imageSize;

    // PNG Signature
    size += 8;

    // IHDR
    size += /* IHDR data */ 13 + /* chunk */ 12;

    // PLTE
    if (this.colourType === PngColourType.INDEXED_COLOR) {
      size += /* PLTE data */ this.palette.length + /* chunk */ 12;

      // tRNS
      if (this.withAlpha) {
        size += /* tRNS data */ this.trns.length + /* chunk */ 12;
      }

      pixelWidth = 1;
    } else {
      pixelWidth = this.withAlpha ? 4 : 3;
    }

    // IDAT
    imageSize = (this.width * pixelWidth + /* filter */ 1) * this.height;
    size += ( /* ZLIB non-compressed */
      /* cmf    */ 1 +
      /* flg    */ 1 +
      /* data   */ imageSize +
      /* header */ (
      (/* bfinal, btype */ 1 +
        /* len           */ 2 +
        /* nlen          */ 2) *
        /* number of blocks */ (1 + (imageSize / mBlockSize | 0))
      ) +
      /* adler  */ 4
    ) + 12;

    // IEND
    size += /* chunk*/ 12;

    return size;
  };

  /**
   * parse lossless image.
   */
  Lossless.prototype.parse = function() {
    /** @type {Breader} */
    var tReader = this.reader;
    /** @type {LosslessFormat} */
    var tFormat = this.format = tReader.B();
    /** @type {number} */
    var tPaletteSize;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tPalette;
    /** @type {number} */
    var tPp = 0;
    /** @type {number} */
    var tTp = 0;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tTmpPalette;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tTrns;
    /** @type {number} */
    var alpha;
    /** @type {number} */
    var bufferSize;
    /** @type {number} */
    var i;

    this.width = tReader.I16();
    this.height = tReader.I16();

    // indexed-color
    if (tFormat === LosslessFormat.COLOR_MAPPED) {
      this.colourType = PngColourType.INDEXED_COLOR;

      // palette
      tPaletteSize = (tReader.B() + 1);
      if (this.withAlpha) {
        tTrns = this.trns = new (mHaveTypedArray ? Uint8Array : Array)(tPaletteSize);
      }
      tPaletteSize *= (3 + this.withAlpha);
      --this.size;

      // buffer size
      bufferSize = tPaletteSize +
        /* width with padding * height */((this.width + 3) & -4) * this.height;
    // truecolor
    } else {
      this.colourType = (!this.withAlpha) ?
        PngColourType.TRUECOLOR : PngColourType.TRUECOLOR_WITH_ALPHA;

      // buffer size
      if (tFormat === LosslessFormat.RGB24) {
        bufferSize = 4 * this.width * this.height;
      } else if (tFormat === LosslessFormat.RGB15) {
        bufferSize = 2 * this.width * this.height;
      }
    }

    // compressed image data
    this.plain = new Zlib.Inflate(
      tReader.sub(tReader.tell(), this.size),
      {
        bufferSize: bufferSize
      }
    ).decompress();
    tReader.seek(this.size);

    // palette
    if (tFormat === LosslessFormat.COLOR_MAPPED) {
      // RGB palette
      if (!this.withAlpha) {
        this.palette = (
          this.plain instanceof Array ?
          this.plain.slice(0, tPaletteSize) :
          this.plain.subarray(0, tPaletteSize)
        );
      // RGBA palette
      } else {
        tTmpPalette = (
          this.plain instanceof Array ?
          this.plain.slice(0, tPaletteSize) :
          this.plain.subarray(0, tPaletteSize)
        );
        tPalette = this.palette = new (mHaveTypedArray ? Uint8Array : Array)(tPaletteSize * 3 / 4);

        if (mHaveAndroidAlphaBug) {
          for (i = 0; tTp < tPaletteSize; i += 4) {
            alpha = tTrns[tTp++] = tTmpPalette[i + 3];
            tPalette[tPp++] = tTmpPalette[i    ]; // red
            tPalette[tPp++] = tTmpPalette[i + 1]; // green
            tPalette[tPp++] = tTmpPalette[i + 2]; // blue
          }
        } else {
          for (i = 0; tTp < tPaletteSize; i += 4) {
            alpha = tTrns[tTp++] = tTmpPalette[i + 3];
            tPalette[tPp++] = tTmpPalette[i    ] * 255 / alpha | 0; // red
            tPalette[tPp++] = tTmpPalette[i + 1] * 255 / alpha | 0; // green
            tPalette[tPp++] = tTmpPalette[i + 2] * 255 / alpha | 0; // blue
          }
        }
      }
      this.plain = (
        mHaveTypedArray ?
        new Uint8Array(this.plain.buffer, tPaletteSize, this.plain.length - tPaletteSize) :
        this.plain.slice(tPaletteSize, this.plain.length)
      );
    }
  };

  /**
   * create new Image element.
   * @param {number} pId The ID of this image.
   * @return {Object} Image information.
   */
  Lossless.prototype.getImage = function(pId) {
    /** @type {HTMLImageElement} */
    var tImage = new Image();
    /** @type {!(Array.<number>|Uint8Array)} */
    var tPng = this.getPNG();
    /** @type {Blob} */
    var tBlob = mNewBlob([tPng], {type: 'image/png'});

    return mCreateImage(pId, tBlob).data;
  };

  /**
   * create new Canvas element.
   * @return {HTMLCanvasElement}
   */
  Lossless.prototype.getCanvas = function() {
    /** @type {HTMLCanvasElement} */
    var tCanvas = document.createElement('canvas');
    /** @type {CanvasRenderingContext2D} */
    var tContext = tCanvas.getContext('2d');
    /** @type {ImageData} */
    var tImageData;
    /** @type {!(CanvasPixelArray|Uint8ClampedArray)} */
    var tPixelArray;
    /** @type {LosslessFormat} */
    var tFormat = this.format;
    /** @type {number} */
    var tWidthWithPadding;
    /** @type {number} */
    var tOp = 0;
    /** @type {number} */
    var tIp = 0;
    /** @type {number} */
    var tPlain = this.plain;
    /** @type {number} */
    var tLength;
    /** @type {number} */
    var tX;
    /** @type {number} */
    var tWidth = this.width;
    /** @type {number} */
    var tIndex;
    /** @type {number} */
    var tAlpha;
    /** @type {number} */
    var tReserved;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tPalette = this.palette;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tTrns = this.trns;

    tCanvas.width = this.width;
    tCanvas.height = this.height;

    tImageData = tContext.getImageData(0, 0, this.width, this.height);
    tPixelArray = tImageData.data;
    tLength = tPixelArray.length;

    // Colormapped
    if (tFormat === LosslessFormat.COLOR_MAPPED) {
      // set RGBA
      tWidthWithPadding = (tWidth + 3) & -4;
      while (tOp < tLength) {
        // write color-map index
        for (tX = 0; tX < tWidth; ++tX) {
          tIndex = tPlain[tIp + tX] * 3;
          tPixelArray[tOp++] = tPalette[tIndex    ];
          tPixelArray[tOp++] = tPalette[tIndex + 1];
          tPixelArray[tOp++] = tPalette[tIndex + 2];
          tPixelArray[tOp++] = this.withAlpha ? tTrns[tIndex / 3] : 255; // TODO
        }

        // next
        tIp += tWidthWithPadding;
      }
    // Direct
    } else {
      // set RGBA
      if (tFormat === LosslessFormat.RGB24) {
        if (this.withAlpha) {
          if (mHaveAndroidAlphaBug) {
            while (tOp < tLength) {
              tAlpha = tPlain[tIp++];
              tPixelArray[tOp++] = tPlain[tIp++];
              tPixelArray[tOp++] = tPlain[tIp++];
              tPixelArray[tOp++] = tPlain[tIp++];
              tPixelArray[tOp++] = tAlpha;
            }
          } else {
            while (tOp < tLength) {
              tAlpha = tPlain[tIp++];
              tPixelArray[tOp++] = tPlain[tIp++] * 255 / tAlpha | 0;
              tPixelArray[tOp++] = tPlain[tIp++] * 255 / tAlpha | 0;
              tPixelArray[tOp++] = tPlain[tIp++] * 255 / tAlpha | 0;
              tPixelArray[tOp++] = tAlpha;
            }
          }
        } else {
          while (tOp < tLength) {
            tIp++;
            tPixelArray[tOp++] = tPlain[tIp++];
            tPixelArray[tOp++] = tPlain[tIp++];
            tPixelArray[tOp++] = tPlain[tIp++];
            tPixelArray[tOp++] = 255;
          }
        }
      } else if (tFormat === LosslessFormat.RGB15) {
        while (tOp < tLength) {
          tReserved = (tPlain[tIp++] << 8) | tPlain[tIp++];
          tPixelArray[tOp++] = (tReserved >> 7) & 0xf8; // >> 10 << 3, 0x1f << 3
          tPixelArray[tOp++] = (tReserved >> 2) & 0xf8; // >> 5  << 3, 0x1f << 3
          tPixelArray[tOp++] = (tReserved << 3) & 0xf8; //       << 3, 0x1f << 3
          tPixelArray[tOp++] = 255;
        }
      } else {
        throw new Error('unknown format: ' + tFormat);
      }
    }

    tContext.putImageData(tImageData, 0, 0);

    return tCanvas;
  };

  /**
   * create PNG buffer.
   * @return {!(Array.<number>|Uint8Array)} png bytearray.
   */
  Lossless.prototype.getPNG = function() {
    /** @type {number} */
    var tBufferSize = this.calcBufferSize();

    /** @type {!(Array.<number>|Uint8Array)} */
    this.png = (
      mHaveTypedArray ?
      new Uint8Array(tBufferSize) :
      new Array(tBufferSize > 0xffff ? 0xffff : tBufferSize)
    );

    this.writeSignature();
    this.writeIHDR();
    if (this.format === LosslessFormat.COLOR_MAPPED) {
      this.writePLTE();
      if (this.withAlpha) {
        this.writeTRNS();
      }
    }
    this.writeIDAT();
    this.writeIEND();
    this.finish();

    return this.png;
  };

  /**
   * truncate output buffer.
   * @return {!(Array.<number>|Uint8Array)} png bytearray.
   */
  Lossless.prototype.finish = function() {
    if (mHaveTypedArray) {
      this.png = this.png.subarray(0, this.pp);
    } else {
      this.png.length = this.pp;
    }
    return this.png;
  };

  /**
   * write png signature.
   */
  Lossless.prototype.writeSignature = function() {
    /** @const @type {Array.<number>} */
    var signature = [137, 80, 78, 71, 13, 10, 26, 10];

    if (mHaveTypedArray) {
      this.png.set(signature, this.pp);
    } else {
      this.set(this.png, signature, this.pp);
    }

    this.pp += 8;
  };

  /**
   * @param {!(Array.<number>|Uint8Array)} dst
   * @param {!(Array.<number>|Uint8Array)} src
   * @param {number=} opt_pos
   */
  Lossless.prototype.set = function(dst, src, opt_pos) {
    /** @type {number} */
    var i;
    /** @type {number} */
    var il;

    if (typeof opt_pos !== 'number') {
      opt_pos = 0;
    }

    for (i = 0, il = src.length; i < il; ++i) {
      dst[opt_pos + i] = src[i];
    }
  };

  /**
   * write png chunk.
   * @param {string} pType chunk type.
   * @param {!(Array.<number>|Uint8Array)} pData chunk data.
   */
  Lossless.prototype.writeChunk = function(pType, pData) {
    /** @type {number} */
    var tDataLength = pData.length;
    /** @type {Array.<number>} */
    var tTypeArray = [
      pType.charCodeAt(0) & 0xff, pType.charCodeAt(1) & 0xff,
      pType.charCodeAt(2) & 0xff, pType.charCodeAt(3) & 0xff
    ];
    /** @type {number} */
    var tCrc32;

    var tPng = this.png;
    var tPp = this.pp;

    // length
    tPng[tPp++] = (tDataLength >> 24) & 0xff;
    tPng[tPp++] = (tDataLength >> 16) & 0xff;
    tPng[tPp++] = (tDataLength >>  8) & 0xff;
    tPng[tPp++] = (tDataLength      ) & 0xff;

    // type
    tPng[tPp++] = tTypeArray[0];
    tPng[tPp++] = tTypeArray[1];
    tPng[tPp++] = tTypeArray[2];
    tPng[tPp++] = tTypeArray[3];

    // data
    if (mHaveTypedArray) {
      tPng.set(pData, tPp);
    } else {
      this.set(tPng, pData, tPp);
    }
    tPp += tDataLength;

    // crc32
    tCrc32 = Zlib.CRC32.update(pData, Zlib.CRC32.calc(tTypeArray));
    tPng[tPp++] = (tCrc32 >> 24) & 0xff;
    tPng[tPp++] = (tCrc32 >> 16) & 0xff;
    tPng[tPp++] = (tCrc32 >>  8) & 0xff;
    tPng[tPp++] = (tCrc32      ) & 0xff;

    this.pp = tPp;
  };

  /**
   * write PNG IHDR chunk.
   */
  Lossless.prototype.writeIHDR = function() {
    /** @type {number} */
    var tWidth = this.width;
    /** @type {number} */
    var tHeight = this.height;
    /** @type {PngColourType} */
    var tColourType = this.colourType;

    this.writeChunk('IHDR', [
      /* width       */
      (tWidth  >> 24) & 0xff, (tWidth  >> 16) & 0xff,
      (tWidth  >>  8) & 0xff, (tWidth       ) & 0xff,
      /* height      */
      (tHeight >> 24) & 0xff, (tHeight >> 16) & 0xff,
      (tHeight >>  8) & 0xff, (tHeight      ) & 0xff,
      /* bit depth   */ 8,
      /* colour type */ tColourType,
      /* compression */ 0,
      /* filter      */ 0,
      /* interlace   */ 0
    ]);
  };

  /**
   * write PNG PLTE chunk.
   */
  Lossless.prototype.writePLTE = function() {
    this.writeChunk('PLTE', this.palette);
  };

  /**
   * write PNG tRNS chunk.
   */
  Lossless.prototype.writeTRNS = function() {
    this.writeChunk('tRNS', this.trns);
  };

  /**
   * wrtie PNG IDAT chunk.
   */
  Lossless.prototype.writeIDAT = function() {
    /** @type {number} */
    var tSize;
    /** @type {number} */
    var tLength;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tImage;
    /** @type {number} */
    var tOp = 0;
    /** @type {number} */
    var tIp = 0;
    /** @type {number} */
    var tRed;
    /** @type {number} */
    var tGreen;
    /** @type {number} */
    var tBlue;
    /** @type {number} */
    var tReserved;
    /** @type {number} */
    var tX = 0;
    /** @type {number} */
    var tWidthWithPadding;

    var tPlain = this.plain;
    var tWidth = this.width;
    var tHeight = this.height;
    var tFormat = this.format;

    // calculate buffer size
    switch (this.colourType) {
      case PngColourType.INDEXED_COLOR:
        tLength = tWidth;
        break;
      case PngColourType.TRUECOLOR:
        tLength = tWidth * 3;
        break;
      default:
        console.warn('invalid png colour type');
    }
    tSize = tLength * tHeight + tHeight;

    // create png idat data
    tImage = new (mHaveTypedArray ? Uint8Array : Array)(tSize);
    // indexed-color png
    if (tFormat === LosslessFormat.COLOR_MAPPED) {
      tWidthWithPadding = (tWidth + 3) & -4;
      while (tOp < tSize) {
        // scanline filter
        tImage[tOp++] = 0;

        // write color-map index
        if (mHaveTypedArray) {
          tImage.set(tPlain.subarray(tIp, tIp + tWidth), tOp);
        } else {
          this.set(tImage, tPlain.slice(tIp, tIp + tWidth), tOp);
        }
        tOp += tWidth;

        // next
        tIp += tWidthWithPadding;
      }
    // truecolor png
    } else {
      while (tOp < tSize) {
        // scanline filter
        if (tX++ % tWidth === 0) {
          tImage[tOp++] = 0;
        }

        // read RGB
        if (tFormat === LosslessFormat.RGB24) {
          tReserved = tPlain[tIp++];
          tRed      = tPlain[tIp++];
          tGreen    = tPlain[tIp++];
          tBlue     = tPlain[tIp++];
        } else if (tFormat === LosslessFormat.RGB15) {
          tReserved = (tPlain[tIp++] << 8) | tPlain[tIp++];
          tRed   = (tReserved >> 7) & 0xf8; // >> 10 << 3, 0x1f << 3
          tGreen = (tReserved >> 2) & 0xf8; // >> 5  << 3, 0x1f << 3
          tBlue  = (tReserved << 3) & 0xf8; //       << 3, 0x1f << 3
        }

        // write RGB
        tImage[tOp++] = tRed;
        tImage[tOp++] = tGreen;
        tImage[tOp++] = tBlue;
      }
    }

    this.writeChunk('IDAT', this.fakeZlib(tImage));
  };

  /**
   * wrtie PNG IDAT chunk (with alpha channel).
   */
  Lossless.prototype.writeIDATwithAlpha = function() {
    /** @type {number} */
    var tSize;
    /** @type {number} */
    var tLength;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tImage;
    /** @type {number} */
    var tOp = 0;
    /** @type {number} */
    var tIp = 0;
    /** @type {number} */
    var tRed;
    /** @type {number} */
    var tGreen;
    /** @type {number} */
    var tBlue;
    /** @type {number} */
    var tAlpha;
    /** @type {number} */
    var tX = 0;
    /** @type {number} */
    var tWidthWithPadding;

    var tPlain = this.plain;
    var tWidth = this.width;
    var tHeight = this.height;
    var tFormat = this.format;

    // calculate buffer size
    switch (this.colourType) {
      case PngColourType.INDEXED_COLOR:
        tLength = tWidth;
        break;
      case PngColourType.TRUECOLOR_WITH_ALPHA:
        tLength = tWidth * 4;
        break;
      default:
        console.warn('invalid png colour type');
    }
    tSize = (tLength + 1) * tHeight;

    // create png idat data
    tImage = new (mHaveTypedArray ? Uint8Array : Array)(tSize);
    // indexed-color png
    if (tFormat === LosslessFormat.COLOR_MAPPED) {
      tWidthWithPadding = (tWidth + 3) & -4;
      while (tOp < tSize) {
        // scanline filter
        tImage[tOp++] = 0;

        // write color-map index
        if (mHaveTypedArray) {
          tImage.set(tPlain.subarray(tIp, tIp + tWidth), tOp);
        } else {
          this.set(tImage, tPlain.slice(tIp, tIp + tWidth), tOp);
        }
        tOp += tWidth;

        // next
        tIp += tWidthWithPadding;
      }
    // truecolor png
    } else {
      while (tOp < tSize) {
        // scanline filter
        if (tX++ % tWidth === 0) {
          tImage[tOp++] = 0;
        }

        // read RGB
        tAlpha = tPlain[tIp++];
        tRed   = tPlain[tIp++] * 255 / tAlpha | 0;
        tGreen = tPlain[tIp++] * 255 / tAlpha | 0;
        tBlue  = tPlain[tIp++] * 255 / tAlpha | 0;

        // write RGB
        tImage[tOp++] = tRed;
        tImage[tOp++] = tGreen;
        tImage[tOp++] = tBlue;
        tImage[tOp++] = tAlpha;
      }
    }

    this.writeChunk('IDAT', this.fakeZlib(tImage));
  };

  /**
   * wrtie PNG IEND chunk.
   */
  Lossless.prototype.writeIEND = function() {
    this.writeChunk('IEND', []);
  };

  /**
   * create non-compressed zlib buffer.
   * @param {!(Array.<number>|Uint8Array)} pData plain data.
   * @return {!(Array.<number>|Uint8Array)}
   */
  Lossless.prototype.fakeZlib = function(pData) {
    /** @type {number} */
    var tBfinal;
    /** @type {number} */
    var tBtype = 0; // 非圧縮
    /** @type {number} */
    var tLen;
    /** @type {number} */
    var tNlen;
    /** @type {!(Array.<number>|Uint8Array)} */
    var tBlock;
    /** @type {number} */
    var tAdler32;
    /** @type {number} */
    var tIp = 0;
    /** @type {number} */
    var tOp = 0;
    /** @type {number} */
    var tSize = (
      /* cmf    */ 1 +
      /* flg    */ 1 +
      /* data   */ pData.length +
      /* header */ (
        (/* bfinal, btype */ 1 +
         /* len           */ 2 +
         /* nlen          */ 2) *
         /* number of blocks */ (1 + (pData.length / mBlockSize | 0))
      ) +
      /* adler  */ 4
    );
    /** @type {Uint8Array} */
    var tOutput = mHaveTypedArray ?
      new Uint8Array(tSize) : new Array(tSize > 0xffff ? 0xffff : tSize);

    // zlib header
    tOutput[tOp++] = 0x78; // CINFO: 7, CMF: 8
    tOutput[tOp++] = 0x01; // FCHECK: 1, FDICT, FLEVEL: 0

    // zlib body
    do {
      tBlock = mHaveTypedArray ?
        pData.subarray(tIp, tIp += mBlockSize) : pData.slice(tIp, tIp += mBlockSize);
      tBfinal = (tBlock.length < mBlockSize || tIp + tBlock.length === pData.length) ? 1 : 0;

      // block header
      tOutput[tOp++] = tBfinal;

      // len
      tLen = tBlock.length;
      tOutput[tOp++] = (tLen      ) & 0xff;
      tOutput[tOp++] = (tLen >>> 8) & 0xff;

      // nlen
      tNlen = 0xffff - tLen;
      tOutput[tOp++] = (tNlen      ) & 0xff;
      tOutput[tOp++] = (tNlen >>> 8) & 0xff;

      // data
      if (mHaveTypedArray) {
        tOutput.set(tBlock, tOp);
      } else {
        this.set(tOutput, tBlock, tOp);
      }
      tOp += tBlock.length;
    } while (!tBfinal);

    // adler-32
    tAdler32 = Zlib.Adler32(pData);
    tOutput[tOp++] = (tAdler32 >> 24) & 0xff;
    tOutput[tOp++] = (tAdler32 >> 16) & 0xff;
    tOutput[tOp++] = (tAdler32 >>  8) & 0xff;
    tOutput[tOp++] = (tAdler32      ) & 0xff;

    return tOutput;
  };

//-----------------------------------------------------------------------------
// Code copied from zlib.js at https://github.com/imaya/zlib.js
// with permission from author.
//-----------------------------------------------------------------------------

/**
 * Adler32 ハッシュ値の作成
 * @param {!(Array|Uint8Array|string)} array 算出に使用する byte array.
 * @return {number} Adler32 ハッシュ値.
 */
Zlib.Adler32 = function(array) {
  if (typeof(array) === 'string') {
    array = Zlib.Util.stringToByteArray(array);
  }
  return Zlib.Adler32.update(1, array);
};

/**
 * Adler32 ハッシュ値の更新
 * @param {number} adler 現在のハッシュ値.
 * @param {!(Array|Uint8Array)} array 更新に使用する byte array.
 * @return {number} Adler32 ハッシュ値.
 */
Zlib.Adler32.update = function(adler, array) {
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
    tlen = len > Zlib.Adler32.OptimizationParameter ?
      Zlib.Adler32.OptimizationParameter : len;
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
Zlib.Adler32.OptimizationParameter = 1024;

}(this));
