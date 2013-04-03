(function(global) {

  var mPolyFills = global.quickswf.polyfills = {};

  var mHaveBlob = ('Blob' in global);
  var mHaveBlobConstructor = false;

  if (mHaveBlob) {
    try {
      new Blob();
      mHaveBlobConstructor = true;
    } catch (e) {
      mHaveBlobConstructor = false;
    }
  }

  mPolyFills.newBlob = function(pData, pOptions) {
    pData = pData || [''];
    pOptions = pOptions || {};
    if (mHaveBlobConstructor) {
      return new Blob(pData, pOptions);
    } else {
      var BlobBuilder = window.BlobBuilder 
          || window.WebKitBlobBuilder 
          || window.MozBlobBuilder 
          || window.MSBlobBuilder;

      if (BlobBuilder){
        var tBuilder = new BlobBuilder();
        for (var i = 0, il = pData.length; i < il; i++) {
          var tData = pData[i];
          if (tData.buffer) {
            var tNewArray = new Uint8Array(tData.length);
            tNewArray.set(tData);
            tBuilder.append(tNewArray.buffer);
          } else {
            tBuilder.append(tData);
          }
        }
        return tBuilder.getBlob(pOptions.type);
      }

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

}(this));
