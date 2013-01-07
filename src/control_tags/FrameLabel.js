/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['43'] = frameLabel;

  function frameLabel(pLength) {
    this.currentSprite.frameLabels[this.r.s()] = this.currentFrame;
  }

}(this));

