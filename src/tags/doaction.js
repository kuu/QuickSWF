/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['12'] = doAction;

  function doAction(pLength) {
    var tReader = this.r;
    this.add({
      type: 'script',
      script: tReader.sub(tReader.tell(), pLength)
    });
    tReader.seek(pLength);
  }

}(this));
