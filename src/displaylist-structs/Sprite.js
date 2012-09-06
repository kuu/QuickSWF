/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var mStructs = global.quickswf.structs;
  mStructs.Sprite = Sprite;

  /**
   * @constructor
   * @class {quickswf.structs.Sprite}
   */
  function Sprite() {
    this.id = -1;
    this.frameCount = 0;
    this.frames = new Array(0);
    this.frameLabels = new Object();
  }

  Sprite.prototype.displayListType = 1;

  /**
   * Loads a Sprite.
   * @param {quickswf.Reader} pReader The reader to read from.
   * @return {quickswf.structs.Sprite} The parsed Sprite.
   */
  Sprite.load = function(pReader) {
    var tSprite = new Sprite();
    tSprite.id = pReader.I16();
    tSprite.frameCount = tSprite.frames.length = pReader.I16();
    return tSprite;
  };

}(this));
