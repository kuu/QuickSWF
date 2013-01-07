/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['39'] = defineSprite;
  global.quickswf.structs.Sprite = Sprite;

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

  Sprite.prototype.displayListType = 'DefineSprite';

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

  function defineSprite(pLength) {
    var tSprite = Sprite.load(this.r);
    this.spriteStack.push(this.currentSprite);
    this.currentSprite = tSprite;
    this.frameStack.push(this.currentFrame);
    this.currentFrame = 0;

    this.swf.dictionary[tSprite.id + ''] = tSprite;
  }

}(this));
