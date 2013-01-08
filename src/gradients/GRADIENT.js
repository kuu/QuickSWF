/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.GRADIENT = GRADIENT;
  global.quickswf.structs.Stop = Stop;

  var RGBA = global.quickswf.structs.RGBA;

  /**
   * @constructor
   * @class {quickswf.structs.GRADIENT}
   */
  function GRADIENT() {
    this.spreadMode = 0;
    this.interpolationMode = 0;
    this.stops = new Array();
    this.focalPoint = 0.0;
  }

  /**
   * @constructor
   * @private
   * @param {bool} pIsMorph True if morph shape.
   */
  function Stop(pIsMorph) {
    if (pIsMorph) {
      this.startRatio = 0;
      this.startColor = null;
      this.endRatio = 0;
      this.endColor = null;
    } else {
      this.ratio = 0;
      this.color = null;
    }
  }

  /**
   * Loads a GRADIENT type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if we need to parse colour.
   * @param {bool} pIsMorph True if morph shape.
   * @return {quickswf.structs.GRADIENT} The loaded GRADIENT.
   */
  GRADIENT.load = function(pReader, pWithAlpha, pIsMorph) {
    var tGradient = new GRADIENT();

    tGradient.spreadMode = pReader.bp(2);
    tGradient.interpolationMode = pReader.bp(2);
    var tStops = tGradient.stops;
    var tCount = tStops.length = pReader.bp(4);
    var tStop;

    for (var i = 0; i < tCount; i++) {
      tStop = new Stop(pIsMorph);
      if (pIsMorph) {
        tStop.startRatio = pReader.B();
        tStop.startColor = RGBA.load(pReader, true);
        tStop.endRatio = pReader.B();
        tStop.endColor = RGBA.load(pReader, true);
      } else {
        tStop.ratio = pReader.B();
        tStop.color = RGBA.load(pReader, pWithAlpha);
      }
      tStops[i] = tStop;
    }

    return tGradient;
  };

}(this));
