/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.EventSound = EventSound;
  global.quickswf.structs.SoundData = SoundData;
  global.quickswf.structs.SoundInfo = SoundInfo;
  global.quickswf.structs.SoundStreamHead = SoundStreamHead;

  /**
   * @constructor
   * @class {quickswf.structs.EventSound}
   */
  function EventSound(pFmt, pFs, pDepth, pCh, pLen, pData) {
    this.soundFormat = pFmt; // Coding format ('0'=PCM, '1'=ADPCM, '2'=MP3, '3'=PCM(LSB first))
    this.soundRate = pFs; // Sampling rate ('0'=5.5kHz, '1'=11kHz, '2'=22kHz, '3'=44kHz)
    this.soundSize = pDepth; // Bit depth ('0'=8bit, '1'=16bit)
    this.soundType = pCh; // Number of channels ('0'=mono, '1'=stereo)
    this.soundSampleCount = pLen; // Number of samples (for stereo, number of sample pairs)
    this.soundData = pData; // Byte array
  }

  /**
   * Loads a EventSound type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {quickswf.Reader} pBounds Start of the next tag.
   * @return {quickswf.structs.EventSound} The loaded EventSound.
   */
  EventSound.load = function(pReader, pBounds) {
    var tFmt = pReader.bp(4);
    var tFs = pReader.bsp(2);
    var tDepth = pReader.bsp(1);
    var tCh = pReader.bsp(1);
    var tLen = pReader.I32();
    var tData = SoundData.load(pReader, tFmt, pBounds);
    return new EventSound(tFmt, tFs, tDepth, tCh, tLen, tData);
  };


  /**
   * @constructor
   * @class {quickswf.structs.SoundData}
   */
  function SoundData(pData, pRaw, pType) {
    if (!pRaw || pRaw === pData) {
      this.raw = pData;
    } else {
      this.raw = pRaw;
      for (var k in pData) {
        if (pData[k] !== pRaw) {
          this[k] = pData[k];
        }
      }
    }
    this.mimeType = pType;
  }

  /**
   * Loads a SoundData type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @param {quickswf.Reader} pBounds Start of the next tag.
   * @return {quickswf.structs.EventSound} The loaded SoundData.
   */
  SoundData.load = function(pReader, pFmt, pBounds) {
    var tData, tOffset, tRaw, tType;

    if (pFmt === 0 || pFmt === 3) {
console.log('+++ PCM');
      // PCM
      tOffset = pReader.tell();
      tData = pReader.sub(tOffset, pBounds - tOffset);
      tType = 'audio/i-dont-know-the-mimetype-for-this';
    } else if (pFmt === 1) {
console.log('+++ ADPCM');
      // ADPCM
      tData = {};
      tData.adpcmCodeSize = pReader.bsp(2); 
      tOffset = pReader.tell();
      tData.adpcmPackets = pReader.sub(tOffset, pBounds - tOffset);
      tRaw = tData.adpcmPackets;
      tType = 'audio/i-dont-know-the-mimetype-for-this';
    } else if (pFmt === 2) {
console.log('+++ MP3');
      // MP3
      tData = {};
      tData.seekSamples = pReader.SI16();
      tOffset = pReader.tell();
      tData.mp3Frames = pReader.sub(tOffset, pBounds - tOffset);
      tRaw = tData.mp3Frames;
      tType = 'audio/mp3';
    }
    pReader.seekTo(pBounds);

    return new SoundData(tData, tRaw, tType);
  };
  /**
   * @constructor
   * @class {quickswf.structs.SoundInfo}
   */
  function SoundInfo(pStop, pNoMul, pEnv, pLoop, pOut, pIn) {
    this.syncStop = pStop; // Stop the sound now.
    this.syncNoMultiple = pNoMul; // Don't start the sound if already playing.
    this.hasEnvelope = pEnv; // Has envelope info.
    this.hasLoops = pLoop; // Has loop info.
    this.hasOutPoint = pOut; // Has out-point info.
    this.hasInPoint = pIn; // Has in-point infor.
  }

  /**
   * Loads a SoundInfo type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.SoundInfo} The loaded SoundInfo.
   */
  SoundInfo.load = function(pReader) {
    pReader.bp(2); // Skip reserved bits
    var tStop = (pReader.bp(1) === 1);
    var tNoMul = (pReader.bp(1) === 1);
    var tEnv = (pReader.bp(1) === 1);
    var tLoop = (pReader.bp(1) === 1);
    var tOut = (pReader.bp(1) === 1);
    var tIn = (pReader.bp(1) === 1);
    var soundInfo = new SoundInfo(tStop, tNoMul, tEnv, tLoop, tOut, tIn);
    // Number of samples to skip at beginning of sound.
    tIn && (soundInfo.inPoint = pReader.I32());
    // Position in samples of last sample to play.
    tOut && (soundInfo.outPoint = pReader.I32());
    // Sound loop count.
    tLoop && (soundInfo.loopCount = pReader.I16());
    if (tEnv) {
      // Sound Envelope point count.
      soundInfo.envPoints = pReader.B();
      soundInfo.envelopeRecords = new Array(soundInfo.envPoints);
      for (var i = 0, il = soundInfo.envPoints; i < il; i++) {
        // Sound Envelope records.
        soundInfo.envelopeRecords[i].pos44 = pReader.I32();
        soundInfo.envelopeRecords[i].leftLevel = pReader.I16();
        soundInfo.envelopeRecords[i].rightLevel = pReader.I16();
      }
    }
    return soundInfo;
  };

  /**
   * @constructor
   * @class {quickswf.structs.SoundStreamHead}
   */
  function SoundStreamHead(pFmt, pFs, pDepth, pCh, pLen, pLatency) {
    this.soundCompression = pFmt; // Coding format ('0'=PCM, '1'=ADPCM, '2'=MP3, '3'=PCM(LSB first))
    this.soundRate = pFs; // Sampling rate ('0'=5.5kHz, '1'=11kHz, '2'=22kHz, '3'=44kHz)
    this.soundSize = pDepth; // Bit depth ('0'=8bit, '1'=16bit)
    this.soundType = pCh; // Number of channels ('0'=mono, '1'=stereo)
    this.soundSampleCount = pLen; // Number of samples (for stereo, number of sample pairs)
    this.latencySeek = pLatency; // The value here sould match MP3's SeekSamples field in the first SoundStreamBlock.
  }

  /**
   * Loads a SoundStreamHead type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.EventSound} The loaded SoundStreamHead.
   */
  SoundStreamHead.load = function(pReader) {
    pReader.bp(4); // Skip reserved bits
    pReader.bp(4); // Skip advisory bits (PlaybackSoundXxx)
    var tFmt = pReader.bp(4);
    var tFs = pReader.bsp(2);
    var tDepth = pReader.bsp(1);
    var tCh = pReader.bsp(1);
    var tLen = pReader.I16();
    var tLatency = (tFmt !== 2 ? void 0 : pReader.SI16());

    return new SoundStreamHead(tFmt, tFs, tDepth, tCh, tLen, tLatency);
  };
}(this));
