/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['39'] = defineSprite;
  var mStructs = global.quickswf.structs;

  function defineSprite(pLength) {
    var tSprite = mStructs.Sprite.load(this.r);
    this.spriteStack.push(this.currentSprite);
    this.currentSprite = tSprite;
    this.frameStack.push(this.currentFrame);
    this.currentFrame = 0;

    this.swf.dictionary[tSprite.id + ''] = tSprite;
  }

}(this));
