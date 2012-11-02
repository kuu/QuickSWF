/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['14'] = defineSound;
  global.quickswf.Parser.prototype['15'] = startSound;
  global.quickswf.Parser.prototype['18'] = soundStreamHead;
  global.quickswf.Parser.prototype['45'] = soundStreamHead;
  global.quickswf.Parser.prototype['19'] = soundStreamBlock;

  var EventSound = global.quickswf.structs.EventSound;
  var SoundInfo = global.quickswf.structs.SoundInfo;
  var SoundStreamHead = global.quickswf.structs.SoundStreamHead;
  var SoundData = global.quickswf.structs.SoundData;

  var mNewBlob = global.quickswf.polyfills.newBlob;
  var mCreateMedia = global.quickswf.polyfills.createMedia;

  function defineSound(pLength) {
    var tReader = this.r, tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();
    var tSound = EventSound.load(tReader, tBounds);
    tSound.id = tId;
    var tBlob = mNewBlob([tSound.soundData.raw], {type: tSound.soundData.mimeType});
    var tData = mCreateMedia(tId, tBlob);
    this.swf.eventSounds[tId + ''] = tData;
  }

  function startSound(pLength) {
    var tReader = this.r;
    var tId = tReader.I16();
    var tSoundInfo = SoundInfo.load(tReader);

    this.add({
      type: 'startSound',
      soundId: tId,
      soundInfo: tSoundInfo
    });
  }

  function soundStreamHead(pLength) {
    var tReader = this.r;
    this.swf.streamSoundMetadata = SoundStreamHead.load(tReader);
  }

  function soundStreamBlock(pLength) {
    var tMetaData = this.swf.streamSoundMetadata;
    if (tMetaData) {
      var tFmt = tMetaData.soundCompression;
      var tReader = this.r, tBounds = tReader.tell() + pLength;
      var tSound, tSampleCount;

      if (tFmt === 2) {
        // MP3
        tSampleCount = pReader.I16();
      }
      tSound = SoundData.load(tReader, tFmt, tBounds);
      tSound.sampleCount = tSampleCount;

      this.add({
        type: 'soundStreamBlock',
        soundData: tSound
      });
    }
  }

}(this));
