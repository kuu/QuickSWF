/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2012 QuickSWF Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  var PersistentCueListener = global.benri.cues.PersistentCueListener;
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
    // {"(id)" : {listeners : [listener1, listener2, ...], remove : (boolean)}, ...}
    this._listeners = {};

    // The list of CueListener objects to be notified when all the data is loaded.
    this._compListeners = [];
  }

  // A private method to update the internal state.
  MediaLoader.prototype._update = function (pCommand, pEntry) {

    var tOptions = pEntry.options, tDelay,
        i, il, tHash, tId = pEntry.id,
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

    if (pCommand === 'add') {
      tDelay = new PersistentCueListener();
      tHash[tId] = pEntry;
      tListeners = this._listeners[tId];
      if (tListeners === void 0) {
        this._listeners[tId] = {listeners: [tDelay], remove: false};
      } else {
        tListeners.listeners.push(tDelay);
      }
    } else if (pCommand === 'move') {
      delete tHash[tId];
      tListeners = this._listeners[tId];
      if (tListeners) {
        tToNotifyList = tToNotifyList.concat(tListeners.listeners);
        delete this._listeners[tId];
      }
      if (!tListeners || tListeners.remove === false) {
        if (tSlot === void 0) {
          tSlot = this._loaded[tMediaType] = {};
        }
        tSlot[tId] = pEntry;
      }
    } else if (pCommand === 'del') {
      if (tSlot !== void 0) {
        delete tSlot[tId];
      }
    }
    for (i = 0, il = tToNotifyList.length; i < il; i++) {
      if (pEntry.error) {
        tToNotifyList[i].cue('fail', pEntry.data);
      } else {
        tToNotifyList[i].cue('load', pEntry.data);
      }
    }
    if (pCommand === 'move'
        && Object.getOwnPropertyNames(this._wait).length === 0) {
      for (i = 0, il = this._compListeners.length; i < il; i++) {
        this._compListeners[i].cue('complete', null);
      }
      this._compListeners = [];
    }
    return tDelay;
  };

  // A static function to extract the type name (e.g. image, text, etc.) from the entire MIME type.
  var mGetMediaType = function (pMimeType) {
    var tIdx;

    if (!pMimeType) {
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

  var mHaveCreateObjectURL = global.quickswf.browser.HaveCreateObjectURL;

  /**
   * Takes a raw data. Loads/decodes the data asynchronously. Provides methods to access the loaded data.
   * @param {string} pId The id for retrieving the loaded data.
   * @param {Uint8Array or Blob} pData The raw data.
   * @param {string} pType MIME type.
   * @param {boolern} pWait If true, the system cannot go ahead without this data. (default=true)
   * @param {Object} pOptions
   *        The following options are supported:
   *        - wait {boolean} : If true, the system cannot go ahead without this data. (default=true)
   * @return {benri.cues.PersistentCueListener} A delay object.
   *
   *    To process the loaded data, the client needs to set a callback function as follows:
   *      benri.cues.PersistentCueListener.on('load', callback);
   *    To get notified of the failure, the client needs to set a callback function as follows:
   *      benri.cues.PersistentCueListener.on('fail', callback);
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
        tSelf = this, tDelay;

    if ((tMediaType = mGetMediaType(tType)) === null) {
      throw new Error('Mime type is not specified.');
    }

    // Return if the data is already loaded or queried.
    if ((tDelay = this._checkExistence(tMediaType, pId)) !== null) {
      return tDelay;
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
      // We create an <embed> element for other types.
      return this._loadEmbed(tEntry);
    }

    var tCallback = function() {
      var src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      tEntry.data = tElem;
      tEntry.complete = true;
      tSelf._update('move', tEntry);
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
    }, false);

    tElem.src = mGetMediaURL(pData, tType);

    return this._update('add', tEntry);
  };

  // A private static function to get a Blob or Data URL.
  var mGetMediaURL = function (pData, pType) {
    var tBlob, tSrc;

    if (pData instanceof Uint8Array) {
      tBlob = mPolyFills.newBlob([pData], {type: pType});
    } else {
      tBlob = pData;
    }

    if (mHaveCreateObjectURL) {
      tSrc = global.URL.createObjectURL(tBlob);
    } else {
      // Hopefully this is the special object we made in newBlob()
      tSrc = 'data:' + tBlob.type + ';base64,' + global.btoa(tBlob.data);
    }
    return tSrc;
  };

  // A private method to decode the compressed audio data.
  MediaLoader.prototype._loadWebAudio = function (pEntry) {
    var tSelf = this;

    mAudioContext.decodeAudioData(
        pEntry.data,
        function (buffer) {
            pEntry.data = buffer;
            pEntry.complete = true;
            tSelf._update('move', pEntry);
          },
        function (e) {
            console.error('decodeAudioData failed:', e);
            pEntry.complete = true;
            pEntry.error = true;
            tSelf._update('move', pEntry);
          }
      );

    return this._update('add', pEntry);
  };

  var DEFAULT_CHARSET = 'Shift_JIS';

  // A private method to convert the specified text to JavaScript String (UCS.)
  MediaLoader.prototype._loadText = function (pEntry) {

    var tSelf = this, tParams = pEntry.type.split(';'),
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
      });

    return this._update('add', pEntry);
  };

  // A private method to return an <embed> element.
  MediaLoader.prototype._loadEmbed = function (pEntry) {

    var tElem = global.document.createElement('embed'),
        tData = pEntry.data, tDelay,
        tType = pEntry.type;

    tElem.src = mGetMediaURL(tData, tType);
    tElem.type = tType;
    pEntry.data = tElem;
    pEntry.complete = true;
    tDelay = this._update('add', pEntry);
    this._update('move', pEntry);

    return tDelay;
  };

  MediaLoader.prototype._checkExistence = function (pType, pId, pRemove, pListenIfNotExist) {
    var tEntry, tDelay = new PersistentCueListener(), tListeners;

    if (this._loaded[pType]) {
      tEntry = this._loaded[pType][pId];
    }

    if (tEntry) {
      // the data is already loaded.
      if (pRemove) {
        this._update('del', tEntry);
      }
      tDelay.cue('load', tEntry.data);
      return tDelay;
    }
    tListeners = this._listeners[pId];
    if (tListeners) {
      // The data is already requested.
      tListeners.listeners.push(tDelay);
      if (pRemove) {
        tListeners.remove = true;
      }
      return tDelay;
    }
    if (pListenIfNotExist) {
      this._listeners[pId] = {listeners: [tDelay], remove: !!pRemove};
      return tDelay;
    }
    return null;
  };

  /**
   * Method to retrieve the loaded data.
   * @param {string} pType The data type, e.g. "text", "image", etc.
   * @param {string} pId The id for retrieving the loaded data.
   * @param {boolean} pRemove (defaulst=false)
   *    If true, the loaded data is removed and no longer is retrievable.
   * @param {boolean} pAsync (defaulst=false)
   *    If true, this method returns benri.cues.PersistentCueListener object.
   *    To process the loaded data, the client needs to set a callback function as follows:
   *      benri.cues.PersistentCueListener.on('load', callback);
   *    To get notified of the failure, the client needs to set a callback function as follows:
   *      benri.cues.PersistentCueListener.on('fail', callback);
   *    If pAync is false, this method immediately returns the loaded data or null, if the loading is not completed.
   * @return {Any} The loaded data
   */
  MediaLoader.prototype.get = function (pType, pId, pRemove, pAsync) {
    var tEntry;

    if (this._loaded[pType]) {
      tEntry = this._loaded[pType][pId];
    }

    if (pAsync) {
      return this._checkExistence(pType, pId, pRemove, true);
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
   * @return {benri.cues.PersistentCueListener} A delay object.
   *    To get notified when all the data is loaded, the client needs to set a callback function as follows:
   *      benri.cues.PersistentCueListener.on('complete', callback);
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
