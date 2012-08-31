/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['12'] = (global.AtoJ !== void 0 ? doAction : function() {});


  function doAction(pLength) {
    //var tAtoJ = global.AtoJ;
    var tReader = this.r;
    //tAtoJ.toJavaScript(tReader.sub(tReader.tell(), pLength));
    tReader.seek(pLength);
  }

}(this));
