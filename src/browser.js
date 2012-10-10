/**
 * @author Yuta Imaya
 *
 * Copyright (C) 2012 Yuta Imaya.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  /** @type {Object} */
  var mBrowser = global.quickswf.browser = {};

  /** @const @type {boolean} */
  mBrowser.HaveTypedArray = (global.Uint8Array !== void 0);

  /** @const @type {boolean} */
  mBrowser.HaveCreateObjectURL =
    (global.URL || global.webkitURL && global.webkitURL.createObjectURL);

  /** @const @type {boolean} */
  mBrowser.HavePutImageDataAlphaBug = detectAndroidPutImageDataBug();

  /**
   * @return {boolean}
   */
  function detectAndroidPutImageDataBug() {
    /** @type {HTMLCanvasElement} */
    var canvas =
      /** @type {HTMLCanvasElement} */
      document.createElement('canvas');
    /** @type {CanvasRenderingContext2D} */
    var ctx = canvas.getContext('2d');
    /** @type {ImageData} */
    var imageData;
    /** @type {!(CanvasPixelArray|Uint8ClampedArray)} */
    var pixelArray;

    canvas.width = canvas.height = 1;
    imageData = ctx.createImageData(1, 1);
    pixelArray = imageData.data;

    pixelArray[0] = pixelArray[3] = 128;

    ctx.putImageData(imageData, 0, 0);
    imageData = ctx.getImageData(0, 0, 1, 1);
    pixelArray = imageData.data;

    return (pixelArray[0] === 255);
  }

}(this));
