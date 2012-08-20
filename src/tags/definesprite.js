(function(global) {

  global.quickswf.Parser.prototype['39'] = defineSprite;
  var mStructs = global.quickswf.structs;

  function defineSprite(pLength) {
    var tSprite = mStructs.Sprite.load(this.r);
    this.spriteStack.push(tSprite);
    this.currentSprite = tSprite;
    this.frameStack.push(this.currentFrame);
    this.currentFrame = 0;

    this.swf.dictionary[tSprite.id + ''] = tSprite;
  }

}(this));
