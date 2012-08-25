(function(global) {

  global.quickswf.Parser.prototype['12'] = (global.AtoJ !== void 0 ? doAction : function() {});


  function doAction(pLength) {
    var tAtoJ = global.AtoJ;
    var tReader = this.r;
    tAtoJ.toJavaScript(tReader.sub(tReader.tell(), pLength));
    tReader.seek(pLength);
  }

}(this));
