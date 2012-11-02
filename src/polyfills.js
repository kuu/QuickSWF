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

  mPolyFills.createMedia = function(pId, pBlob) {
    var tMedia, tIdx;
    if (!pBlob.type || (tIdx = pBlob.type.indexOf('/')) === -1) {
      return;
    }

    var tTopLevelMediaType = pBlob.type.slice(0, tIdx);
    var tLoadEvent = 'loadeddata';
    if (tTopLevelMediaType === 'image') {
      tMedia = new Image();
      tLoadEvent = 'load';
    } else if (tTopLevelMediaType === 'audio') {
      tMedia = global.document.createElement('audio');
    } else if (tTopLevelMediaType === 'video') {
      tMedia = global.document.createElement('video');
    }

    var tData = {
      id: pId,
      data: tMedia,
      complete: false
    };

    tMedia.addEventListener(tLoadEvent, function() {
      var src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      tData.complete = true;
    }, false);

    tMedia.addEventListener('error', function(e) {
      var src = this.src;

      if (src[0] === 'b' && src[1] === 'l' && src[2] === 'o' && src[3] === 'b' && src[4] === ':') {
        global.URL.revokeObjectURL(src);
      }
      console.error(e);
      tData.complete = true;
    }, false);

    if (mHaveCreateObjectURL === true) {
      tMedia.src = global.URL.createObjectURL(pBlob);
    } else {
      // Hopefully this is the special object we made in newBlob()
      tMedia.src = 'data:' + pBlob.type + ';base64,' + global.btoa(pBlob.data);
    }

    return tData;
  };

}(this));
