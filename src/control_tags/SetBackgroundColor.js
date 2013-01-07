/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['9'] = setBackgroundColor;

  var RGBA = global.quickswf.structs.RGBA;

  function setBackgroundColor(pLength) {
    // TODO: support wmmode transparent.
    var tRGBA = RGBA.load(this.r, false);
    this.add({type: 'background', color: tRGBA});
  }

}(this));
