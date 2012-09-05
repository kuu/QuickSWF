/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var AtoJ = global.AtoJ;

  global.quickswf.Parser.prototype['12'] = (AtoJ !== void 0 ? doAction : function() {});

  var mFunctionMap = {
    findTarget: 'tTarget.findActor(${TARGET});',
    nextFrame: 'tTarget.nextStep();',
    previousFrame: 'tTarget.previousStep();',
    play: 'tTarget.startActing();',
    stop: 'tTarget.stopActing();',
    gotoFrame: 'tTarget.gotoStep(${FRAME_INDEX});',
    gotoLabel: 'tTarget.gotoLabel(${FRAME_LABEL});'
  };

  function doAction(pLength) {
    var tReader = this.r;
    this.add({
      type: 'script',
      script: AtoJ.compileActionScript2(tReader.sub(tReader.tell(), pLength), mFunctionMap)
    });
    tReader.seek(pLength);
  }

}(this));
