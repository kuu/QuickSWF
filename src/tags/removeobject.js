/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['5'] = parseRemoveObject;
  global.quickswf.Parser.prototype['28'] = parseRemoveObject2;

  function parseRemoveObject(pLength) {
    this.r.I16();
    parseRemoveObject2.call(this, pLength);
  }

  function parseRemoveObject2(pLength) {
    var tDepth = this.r.I16();
    this.add({
      type: 'remove',
      depth: tDepth
    });
  }

}(this));
