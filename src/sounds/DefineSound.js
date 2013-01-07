/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['14'] = defineSound;
  global.quickswf.Parser.prototype['15'] = startSound;
  global.quickswf.Parser.prototype['18'] = soundStreamHead;
  global.quickswf.Parser.prototype['45'] = soundStreamHead;
  global.quickswf.Parser.prototype['19'] = soundStreamBlock;

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
    var tFs = pReader.bp(2);
    var tDepth = pReader.bp(1);
    var tCh = pReader.bp(1);
    var tLen = pReader.I32();
    var tMetaData = new SoundMetadata(tFmt, tFs, tDepth, tCh, tLen, 0);
    var tData = SoundData.load(pReader, tMetaData, pBounds);
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
  SoundData.load = function(pReader, pMeta, pBounds) {
    var tFmt = pMeta.soundCompression, 
        tData, tLength, tOffset, tRaw, tType;

    if (tFmt === 0 || tFmt === 3) {
console.log('+++ PCM');
      // PCM
      tOffset = pReader.tell();
      tLength = pBounds - tOffset;
      tData = pReader.sub(tOffset, tLength);
      /* 
       * Need some conversion:
       *  - Number of channels: 
       *        flag ('0'=mono, '1'=stereo)
       *                => Number (channel num)
       *  - Sampling rate: 
       *        flag ('0'=5.5kHz, '1'=11kHz, '2'=22kHz, '3'=44kHz)
       *                => Number (Hz)
       *  - Bit depth: 
       *        flag ('0'=8bits, '1'=16bits)
       *                => Number (bits/sample)
       */
      tRaw = createRIFFChunk(1/*PCM*/, pMeta.soundType + 1, 5500 << pMeta.soundRate, 
              (pMeta.soundSize + 1) * 8, tData, tLength);
      tType = 'audio/wave';
    } else if (tFmt === 1) {
console.log('+++ ADPCM');
      // ADPCM
      tData = {};
      tData.adpcmCodeSize = pReader.bp(2); 
      tOffset = pReader.tell();
      tLength = pBounds - tOffset;
      tData.adpcmPackets = pReader.sub(tOffset, tLength);
      /* 
       *  - Bit depth: 
       *        flag ('0'=2bits, '1'=3bits, '2'=4bits, '3'=5bits/sample)
       *                => Number (bits/sample)
       */
      tRaw = createRIFFChunk(2/*ADPCM*/, pMeta.soundType + 1, 5500 << pMeta.soundRate, 
              tData.adpcmCodeSize + 2, tData.adpcmPackets, tLength);
      tType = 'audio/x-wav';
    } else if (tFmt === 2) {
console.log('+++ MP3');
      // MP3
      tData = {};
      tData.seekSamples = pReader.SI16();
      tOffset = pReader.tell();
      tData.mp3Frames = pReader.sub(tOffset, pBounds - tOffset);
      tData.offset = tOffset;
      tRaw = tData.mp3Frames;
      tType = 'audio/mpeg';
    }
    pReader.seekTo(pBounds);

    return new SoundData(tData, tRaw, tType);
  };

  /**
   * Wraps up the PCM data in RIFF chunk (i.e. WAVE file.)
   * @param {Number}  pFmt Format type (PCM=1, ADPCM=2)
   * @param {Number}  pCh Number of channels.
   * @param {Number}  pFs Sampling rate (n samples per sec.)
   * @param {Number}  pDepth Length of a single sample in bits.
   * @param {Uint8Array}  pData Sound data.
   * @param {Number}  pLength Length of the sound data in bytes.
   * @return {Uint8Array} RIFF chunk (i.e. WAVE file.)
   */
  function createRIFFChunk(pFmt, pCh, pFs, pDepth, pData, pLength) {

    var tRIFF = new Uint8Array(44 + pLength),
        tCurr = 0, tIntBuf = new ArrayBuffer(4),
        tView = new DataView(tIntBuf, 0, 4),
        tBlockSize = pDepth / 8 * pCh,
        tBytesPerSec = tBlockSize * pFs,
        appendChars = function (pStr) {
            for (var i = 0, il = pStr.length; i < il; i++) {
              tRIFF[tCurr++] = pStr.charCodeAt(i);
            }},
        appendInt32 = function (pInt) {
            tView.setInt32(0, pInt, true);
            for (var i = 0; i < 4; i++) {
              tRIFF[tCurr++] = tView.getInt8(i);
            }},
        appendInt16 = function (pInt) {
            tView.setInt16(0, pInt, true);
            for (var i = 0; i < 2; i++) {
              tRIFF[tCurr++] = tView.getInt8(i);
            }};

    // RIFF chunk
    appendChars('RIFF');
    appendInt32(36 + pLength); // total size
    appendChars('WAVE');
    // format chunk
    appendChars('fmt ');
    appendInt32(16); // chunk size
    appendInt16(pFmt); // wave format type (PCM=1)
    appendInt16(pCh);  // number of channels (mono=1, streo=2)
    appendInt32(pFs);  // samples per sec
    appendInt32(tBytesPerSec); // bytes per sec (block size * samples per sec)
    appendInt16(tBlockSize); // block size (bits per sample / 8 * number of channels)
    appendInt16(pDepth); // bits per sample (8bit or 16bit)
    // data chunk
    appendChars('data');
    appendInt32(pLength); // chunk size
    tRIFF.set(pData, 44);

    return tRIFF;
  }

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
  function SoundMetadata(pFmt, pFs, pDepth, pCh, pLen, pLatency) {
    this.soundCompression = pFmt; // Coding format ('0'=PCM, '1'=ADPCM, '2'=MP3, '3'=PCM(LSB first))
    this.soundRate = pFs; // Sampling rate ('0'=5.5kHz, '1'=11kHz, '2'=22kHz, '3'=44kHz)
    this.soundSize = pDepth; // Bit depth ('0'=8bit, '1'=16bit)
    this.soundType = pCh; // Number of channels ('0'=mono, '1'=stereo)
    this.soundSampleCount = pLen; // Number of samples (for stereo, number of sample pairs)
    this.latencySeek = pLatency; // The value here sould match MP3's SeekSamples field in the first SoundStreamBlock.
  }

  /**
   * Loads a SoundMetadata type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.EventSound} The loaded SoundMetadata.
   */
  SoundMetadata.load = function(pReader) {
    pReader.bp(4); // Skip reserved bits
    pReader.bp(4); // Skip advisory bits (PlaybackSoundXxx)
    var tFmt = pReader.bp(4);
    var tFs = pReader.bp(2);
    var tDepth = pReader.bp(1);
    var tCh = pReader.bp(1);
    var tLen = pReader.I16();
    var tLatency = (tFmt !== 2 ? void 0 : pReader.SI16());

    return new SoundMetadata(tFmt, tFs, tDepth, tCh, tLen, tLatency);
  };

  function defineSound(pLength) {
    var tReader = this.r, tBounds = tReader.tell() + pLength;
    var tId = tReader.I16();
    var tSound = EventSound.load(tReader, tBounds);
    tSound.id = tId;
    var tObj = tSound.soundData, tRaw;
    if (tObj.offset === void 0) {
      tRaw = tObj.raw.buffer;
    } else {
      tRaw = tObj.raw.buffer.slice(tObj.offset);
    }
    this.swf.mediaLoader.load(tId, tRaw, tObj.mimeType);
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
      tSound = SoundData.load(tReader, tMetaData, tBounds);
      tSound.sampleCount = tSampleCount;

      this.add({
        type: 'soundStreamBlock',
        soundData: tSound
      });
    }
  }

}(this));
