/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['0'] = end;

  function end(pLength) {
    this.currentSprite = this.spriteStack.pop();
    this.currentFrame = this.frameStack.pop();
  }

}(this));
