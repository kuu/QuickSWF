(function(global) {
  
  global.quicktheatre.Parser.prototype['0'] = end;

  function end(pLength) {
    this.currentSprite = this.spriteStack.pop();
    this.currentFrame = this.frameStack.pop();
  }

}(this));
