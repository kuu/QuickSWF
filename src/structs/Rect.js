(function(global) {

  global.quickswf.structs.Rect = Rect;

  /**
   * @constructor
   * @class {quickswf.structs.Rect}
   */
  function Rect(pLeft, pRight, pTop, pBottom) {
    this.left = pLeft;
    this.right = pRight;
    this.top = pTop;
    this.bottom = pBottom;
  }

  /**
   * Loads a Rect type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.Rect} The loaded Rect.
   */
  Rect.load = function(pReader) {
    var tNumberOfBits = pReader.bp(5);
    var tLeft = pReader.bp(tNumberOfBits);
    var tRight = pReader.bp(tNumberOfBits);
    var tTop = pReader.bp(tNumberOfBits);
    var tBottom = pReader.bp(tNumberOfBits);

    pReader.a();

    return new Rect(tLeft, tRight, tTop, tBottom);
  };

}(this));
