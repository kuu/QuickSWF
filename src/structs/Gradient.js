(function(global) {

  global.quickswf.structs.Gradient = Gradient;

  /**
   * @constructor
   * @class {quickswf.structs.Gradient}
   */
  function Gradient() {
    this.spreadMode = 0;
    this.interpolationMode = 0;
    this.stops = new Array();
    this.focalPoint = 0.0;
  }

  /**
   * @constructor
   * @private
   */
  function Stop() {
    this.ratio = 0;
    this.color = null;
  }

  /**
   * Loads a Gradient type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {bool} pWithAlpha True if we need to parse colour.
   * @return {quickswf.structs.Gradient} The loaded Gradient.
   */
  Gradient.load = function(pReader, pWithAlpha) {
    var RGBA = global.quickswf.structs.RGBA;
    var tGradient = new Gradient();

    tGradient.spreadMode = pReader.bp(2);
    tGradient.interpolationMode = pReader.bp(2);
    var tStops = tGradient.stops;
    var tCount = tStops.length = pReader.bp(4);
    var tStop;

    for (var i = 0; i < tCount; i++) {
      tStop = new Stop();
      tStop.ratio = pReader.B();
      tStop.color = RGBA.load(pReader, pWithAlpha);
      tStops[i] = tStop;
    }

    return tGradient;
  };

}(this));
