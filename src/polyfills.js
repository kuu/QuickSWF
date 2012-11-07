(function(global) {

  var mPolyFills = global.quickswf.polyfills = {};

  var mHaveBlob = global.Blob !== void 0;
  var mHaveBlobConstructor = false;

  if (mHaveBlob) {
    try {
      new Blob();
      mHaveBlobConstructor = true;
    } catch (e) {
      mHaveBlobConstructor = false;
    }
  }
  var mHaveBlobBuilder = global.WebKitBlobBuilder !== void 0;

  mPolyFills.newBlob = function(pData, pOptions) {
    pData = pData || [''];
    pOptions = pOptions || {};
    if (mHaveBlobConstructor) {
      return new Blob(pData, pOptions);
    } else {
      var tNewData = new Array(65536);
      var tIndex = 0;
      for (var i = 0, il = pData.length; i < il; i++) {
        var tDataI = pData[i];
        for (var k = 0, kl = tDataI.length; k < kl; k++) {
          tNewData[tIndex + k] = String.fromCharCode(tDataI[k]);
        }
        tIndex += kl;
      }
      var tResult = {
        length: tNewData.length,
        data: tNewData.join(''),
        type: pOptions.type
      };
      return tResult;
    }
  };

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

  var mAudioContext;
  if (webkitAudioContext) {
    mAudioContext = new webkitAudioContext();
  }

  mPolyFills.createMedia = function(pId, pData, pType) {

    var tType = (pType || pData.type),
        tIdx, tTopLevelMediaType, tElem, tLoadEvent,
        tRet = {
          id: pId,
          data: null,
          complete: false
        },
        src, tBlob;

    if (!tType || (tIdx = tType.indexOf('/')) === -1) {
      return;
    }

    tTopLevelMediaType = tType.slice(0, tIdx);

    if (tTopLevelMediaType === 'image') {
      tElem = new Image();
      tLoadEvent = 'load';
    } else if (tTopLevelMediaType === 'audio') {
      if (mAudioContext) {
        // Web Audio API
        mAudioContext.decodeAudioData(
          pData,
          function (buffer) {
            tRet.data = buffer;
            tRet.complete = true;
          },
          function (e) {
            console.error('decodeAudioData failed:', e);
            tRet.complete = true;
          });
        return tRet;
        
      } else {
        // HTML Audio Element
        tElem = global.document.createElement('audio');
        tLoadEvent = 'loadeddata';
      }
    } else if (tTopLevelMediaType === 'video') {
      tElem = global.document.createElement('video');
      tLoadEvent = 'loadeddata';
    }
    tRet.data = tElem;

    tElem.addEventListener(tLoadEvent, function() {
      src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      tRet.complete = true;
    }, false);

    tElem.addEventListener('error', function(e) {
      src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      console.error(e);
      tRet.complete = true;
    }, false);

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

    return tRet;
  };

}(this));
