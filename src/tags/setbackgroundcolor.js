(function(global) {

  global.quicktheatre.Parser.prototype['9'] = setBackgroundColor;

  var RGBA = global.quicktheatre.structs.RGBA;

  function setBackgroundColor(pLength) {
    // TODO: support wmmode transparent.
    var tRGBA = RGBA.load(this.r, false);

    console.log('Background colour', tRGBA.toString());
  }

}(this));
