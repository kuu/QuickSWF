(function(global) {

  var mPolyFills = global.quickswf.polyfills = {};

  var mHaveBlob = global.Blob !== void 0 ? true: false;
  var mHaveBlobConstructor = false;

  if (mHaveBlob) {
    try {
      new Blob();
      mHaveBlobConstructor = true;
    } catch (e) {
      mHaveBlobConstructor = false;
    }
  }
  var mHaveBlobBuilder = global.WebKitBlobBuilder !== void 0 ? true: false;

  mPolyFills.newBlob = function(pData, pOptions) {
    pData = pData || [''];
    pOptions = pOptions || {};
    if (mHaveBlobConstructor) {
      return new Blob(pData, pOptions);
    } else {
      var tNewData = '';
      for (var i = 0, il = pData.length; i < il; i++) {
        var tDataI = pData[i];
        for (var k = 0, kl = tDataI.length; k < kl; k++) {
          tNewData += String.fromCharCode(tDataI[k]);
        }
      }
      var tResult = {
        length: tNewData.length,
        data: tNewData,
        type: pOptions.type
      };
      return tResult;
    }
  };

  var mCreateObjectURL = null;
  if (global.URL) {
    mCreateObjectURL = global.URL.createObjectURL;
  } else if (global.webkitURL) {
    mCreateObjectURL = global.webkitURL.createObjectURL;
    try {
      var tURL = mCreateObjectURL(mPolyFills.newBlob());
      global.webkitURL.revokeObjectURL(tURL);
    } catch (e) {
      mCreateObjectURL = null; // Android bug.
    }
  }

  mPolyFills.createImage = function(pId, pBlob) {
    var tImage = new Image();

    var tData = {
      id: pId,
      data: tImage,
      complete: false
    };

    tImage.addEventListener('load', function() {
      if (this.src.indexOf('blob:') === 0) {
        global.webkitURL.revokeObjectURL(this.src);
      }
      tData.complete = true;
    }, false);

    tImage.addEventListener('error', function(e) {
      if (this.src.indexOf('blob:') === 0) {
        global.webkitURL.revokeObjectURL(this.src);
      }
      console.error(e);
      tData.complete = true;
    }, false);

    if (mCreateObjectURL !== null) {
      tImage.src = mCreateObjectURL(pBlob);
    } else {
      // Hopefully this is the special object we made in newBlob()
      tImage.src = 'data:' + pBlob.type + ';base64,' + global.btoa(pBlob.data);
    }

    return tData;
  };

}(this));