/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var theatre = global.theatre;
  var PersistentCueListener = theatre.PersistentCueListener;
  var mPolyFills = global.quickswf.polyfills;

  global.quickswf.utils.MediaLoader = MediaLoader;

  /** 
   * A class for loading media data asynchronously.
   * @constructor
   */
  function MediaLoader() {

    // The data to wait.
    // The data with the wait flag on (i.e. pOptions.wait=true) are stored here.
    // The delay object returned by checkComplete() emits an event when this._wait gets empty.
    this._wait = {};

    // The data not to wait.
    // The data with the wait flag off (i.e. pOptions.wait=false) are stored here.
    this._noWait = {};

    // The loaded data.
    // The data is stored as follows:
    // {"(type name e.g. text, image, etc.)" : [data1, data2, ...], ...}
    this._loaded = {};

    // The list of CueListener objects to be notified when the data is loaded.
    // The data is stored as follows:
    // {"(id or alias)" : {listeners : [listener1, listener2, ...], remove : (boolean)}, ...}
    this._listeners = {};

    // The list of CueListener objects to be notified when all the data is loaded.
    this._compListeners = [];
  }

  // A private method to update the internal state.
  MediaLoader.prototype._update = function (pCommand, pEntry) {

    var tOptions = pEntry.options, 
        i, il, tHash, tNames = [pEntry.id], 
        tListeners, tToNotifyList = [], 
        tMediaType = mGetMediaType(pEntry.type),
        tSlot = this._loaded[tMediaType];

    if (pCommand === 'del') {
      tHash = this._loaded;
    } else {
      if (tOptions.wait) {
        tHash = this._wait;
      } else {
        tHash = this._noWait;
      }
    }

    if (tOptions.alias) {
      tNames.concat(tOptions.alias);
    }

    for (i = 0, il = tNames.length; i < il; i++) {
      if (pCommand === 'add') {
        tHash[tNames[i]] = pEntry;
      } else if (pCommand === 'move') {
        delete tHash[tNames[i]];
        tListeners = this._listeners[tNames[i]];
        if (tListeners) {
          tToNotifyList.concat(tListeners.listeners);
          delete this._listeners[tNames[i]];
        }
        if (!tListeners || tListeners.remove === false) {
          if (tSlot === void 0) {
            tSlot = this._loaded[tMediaType] = {};
          }
          tSlot[tNames[i]] = pEntry;
        }
      } else if (pCommand === 'del') {
        if (tSlot !== void 0) {
          delete tSlot[tNames[i]];
        }
      }
    }
    for (i = 0, il = tToNotifyList.length; i < il; i++) {
      if (pEntry.error) {
        tToNotifyList[i].cue('fail', pEntry.data);
      } else {
        tToNotifyList[i].cue('load', pEntry.data);
      }
    }
    if (Object.getOwnPropertyNames(this._wait).length === 0) {
      for (i = 0, il = this._compListeners.length; i < il; i++) {
        this._compListeners[i].cue('complete', null);
      }
      this._compListeners = [];
    }
  };

  // A static function to extract the type name (e.g. image, text, etc.) from the entire MIME type.
  var mGetMediaType = function (pMimeType) {
    var tIdx;

    if (!pMimeType || (tIdx = pMimeType.indexOf('/')) === -1) {
      return null;
    }

    if ((tIdx = pMimeType.indexOf('/')) === -1) {
      return pMimeType;
    }

    return pMimeType.slice(0, tIdx);
  };

  var mAudioContext;
  if (global.webkitAudioContext) {
    mAudioContext = new global.webkitAudioContext();
  }

  var mHaveCreateObjectURL = false;
  if (global.URL) {
    mHaveCreateObjectURL = true;
  } else if (global.webkitURL) {
    try {
      var tURL = global.webkitURL.createObjectURL(mPolyFills.newBlob());
      global.webkitURL.revokeObjectURL(tURL);
      global.URL = global.webkitURL;
      mHaveCreateObjectURL = true;
    } catch (e) {
      mHaveCreateObjectURL = false;
    }
  }

  /**
   * Takes a raw data. Loads/decodes the data asynchronously. Provides methods to access the loaded data.
   * @param {string} pId The id for retrieving the loaded data.
   * @param {Uint8Array or Blob} pData The raw data.
   * @param {string} pType MIME type.
   * @param {boolern} pWait If true, the system cannot go ahead without this data. (default=true)
   * @param {Object} pOptions 
   *        The following options are supported:
   *        - alias {string or Array of string} : 
   *              If exists, the loaded data is also retrievable by the alias. Multiple aliases can be set.
   *        - wait {boolean} : If true, the system cannot go ahead without this data. (default=true)
   * @return {theatre.PersistentCueListener} A delay object.
   *    To process the loaded data, the client needs to set a callback function as follows:
   *      theatre.PersistentCueListener.on('load', callback);
   *    To get notified of the failure, the client needs to set a callback function as follows:
   *      theatre.PersistentCueListener.on('fail', callback);
   *    These callbacks take the following object as a parameter:
   *      - {id: "(specified pId)", data: "(the loaded data or the error object)", type: "(specified pType)"}
   */
  MediaLoader.prototype.load = function (pId, pData, pType, pOptions) {

    var tType = (pType || pData.type),
        tMediaType, tElem, tLoadEvent,
        tEntry = {
          id: pId,
          data: pData,
          type: tType,
          options: pOptions || {wait: true},
          complete: false,
          error: false
        },
        tBlob, tDelay, tSelf = this;

    if ((tMediaType = mGetMediaType(tType)) === null) {
      throw new Error('Mime type is not specified.');
    }

    if (tMediaType === 'image') {
      tElem = new Image();
      tLoadEvent = 'load';
    } else if (tMediaType === 'audio') {
      if (mAudioContext) {
        // Web Audio API
        return this._loadWebAudio(tEntry);
      } else {
        // HTML Audio Element
        tElem = global.document.createElement('audio');
        tLoadEvent = 'loadeddata';
      }
    } else if (tMediaType === 'video') {
      tElem = global.document.createElement('video');
      tLoadEvent = 'loadeddata';
    } else if (tMediaType === 'text') {
      return this._loadText(tEntry);
    } else {
      tElem = global.document.createElement('embed');
      tElem.type = pType;
      tLoadEvent = 'onload';
    }

    tDelay = new PersistentCueListener();

    var tCallback = function() {
      var src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      tEntry.data = tElem;
      tEntry.complete = true;
      tSelf._update('move', tEntry);
      tDelay.cue('load', tEntry);
    };

    if (tLoadEvent.substr(0, 2) === 'on') {
      tElem[tLoadEvent] = tCallback;
    } else {
      tElem.addEventListener(tLoadEvent, tCallback, false);
    }

    tElem.addEventListener('error', function(e) {
      var src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      console.error(e);
      tEntry.complete = true;
      tEntry.error = true;
      tSelf._update('move', tEntry);
      tDelay.cue('error', tEntry);
    }, false);

    this._update('add', tEntry);

    if (pData instanceof Uint8Array) {
      tBlob = mPolyFills.newBlob([pData], {type: tType});
    } else {
      tBlob = pData;
    }

    if (mHaveCreateObjectURL === true) {
      tElem.src = global.URL.createObjectURL(tBlob);
    } else {
      // Hopefully this is the special object we made in newBlob()
      tElem.src = 'data:' + pBlob.type + ';base64,' + global.btoa(tBlob.data);
    }

    return tDelay;
  };

  // A private method to decode the compressed audio data.
  MediaLoader.prototype._loadWebAudio = function (pEntry) {

    var tDelay = new PersistentCueListener(),
        tSelf = this;

    mAudioContext.decodeAudioData(
        pEntry.data,
        function (buffer) {
            pEntry.data = buffer;
            pEntry.complete = true;
            tSelf._update('move', pEntry);
            tDelay.cue('load', pEntry);
          },
        function (e) {
            console.error('decodeAudioData failed:', e);
            pEntry.complete = true;
            pEntry.error = true;
            tSelf._update('move', pEntry);
            tDelay.cue('fail', e);
          }
      );

    this._update('add', pEntry);
    return tDelay;
  };

  var DEFAULT_CHARSET = 'Shift_JIS';

  // A private method to convert the specified text to JavaScript String (UCS.)
  MediaLoader.prototype._loadText = function (pEntry) {

    var tDelay = new PersistentCueListener(),
        tSelf = this, tParams = pEntry.type.split(';'),
        tIndex, tCharEncoding;

    for (var i = 0, il = tParams.length; i < il; i++) {
      tParams[i]
      tIndex = tParams[i].indexOf('charset=');
      if (tIndex !== -1) {
        tCharEncoding = tParams[i].slice(tIndex + 8);
        break;
      }
    }
    if (!tCharEncoding) {
      tCharEncoding = DEFAULT_CHARSET;
    }
      
    global.quickswf.utils.Conv(pEntry.data, tCharEncoding, function(str){
        pEntry.data = str;
        pEntry.complete = true;
        tSelf._update('move', pEntry);
        tDelay.cue('load', pEntry);
      });

    this._update('add', pEntry);

    return tDelay;
  };

  /**
   * Method to retrieve the loaded data.
   * @param {string} pType The data type, e.g. "text", "image", etc.
   * @param {string} pId The id for retrieving the loaded data.
   * @param {boolean} pRemove (defaulst=false)
   *    If true, the loaded data is removed and no longer is retrievable.
   * @param {boolean} pAsync (defaulst=false)
   *    If true, this method returns theatre.PersistentCueListener object.
   *    To process the loaded data, the client needs to set a callback function as follows:
   *      theatre.PersistentCueListener.on('load', callback);
   *    To get notified of the failure, the client needs to set a callback function as follows:
   *      theatre.PersistentCueListener.on('fail', callback);
   *    If pAync is false, this method immediately returns the loaded data or null, if the loading is not completed.
   * @return {Any} The loaded data
   */
  MediaLoader.prototype.get = function (pType, pId, pRemove, pAsync) {
    var tEntry;

    if (this._loaded[pType]) {
      tEntry = this._loaded[pType][pId];
    }

    if (pAsync) {
      var tDelay = new PersistentCueListener();
      if (tEntry) {
        if (pRemove) {
          this._update('del', tEntry);
        }
        tDelay.cue('load', tEntry.data);
      } else {
        // Still loading...
        tListeners = this._listeners;
        if (tListeners[pId] === void 0) {
          tListeners[pId] = {listeners: [tDelay], remove: !!pRemove};
        } else {
          tListeners[pId].listeners.push(tDelay);
          if (pRemove) {
            tListeners[pId].remove = true;
          }
        }
      }
      return tDelay;
    } else {
      // Sync
      if (tEntry) {
        if (pRemove) {
          this._update('del', tEntry);
        }
        return tEntry.data;
      } else {
        return null;
      }
    }
  };

  /**
   * Returns a delay object to notify when all the data is loaded. (only the data added with pWait true.)
   * @return {theatre.PersistentCueListener} A delay object.
   *    To get notified when all the data is loaded, the client needs to set a callback function as follows:
   *      theatre.PersistentCueListener.on('complete', callback);
   *    The callback takes null as a parameter.
   */
  MediaLoader.prototype.checkComplete = function () {
    var tDelay = new PersistentCueListener();
    if (Object.getOwnPropertyNames(this._wait).length === 0) {
      tDelay.cue('complete', null);
    } else {
      this._compListeners.push(tDelay);
    }
    return tDelay;
  };

  /**
   * Method to put an externaly loaded data into this._loaded
   * @param {string} pId The id for retrieving the loaded data.
   * @param {any} pData The externaly decoded or loaded data.
   * @param {string} pType MIME type.
   */
  MediaLoader.prototype.put = function (pId, pData, pType) {
    var tType = (pType || pData.type),
        tEntry = {
          id: pId,
          data: pData,
          type: tType,
          options: {wait: true},
          complete: true,
          error: false
        };
    this._update('move', tEntry);
  };

}(this));
