(function(global) {

  var mStructs = global.quicktheatre.structs;
  mStructs.Sprite = Sprite;

  /**
   * @constructor
   * @class {quicktheatre.structs.Sprite}
   */
  function Sprite() {
    this.id = -1;
    this.frameCount = 0;
    this.frames = new Array(0);
  }

  /**
   * Loads a Sprite.
   * @param {quicktheatre.Reader} pReader The reader to read from.
   * @return {quicktheatre.structs.Sprite} The parsed Sprite.
   */
  Sprite.load = function(pReader) {
    var tSprite = new Sprite();
    tSprite.id = pReader.I16();
    tSprite.frameCount = tSprite.frames.length = pReader.I16();
    return tSprite;
  };

}(this));
