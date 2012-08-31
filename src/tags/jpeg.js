/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.Parser.prototype['6'] = defineBits;
  global.quickswf.Parser.prototype['8'] = defineJpegTable;
  global.quickswf.Parser.prototype['21'] = defineBitsJpeg2;
  global.quickswf.Parser.prototype['35'] = defineBitsJpeg3;

  function defineBits(pLength) {
    var tId = this.r.I16();
    this.swf.images[tId] = getJPEG(this, pLength - 2);
  }

  function defineBitsJpeg2(pLength) {
    var tId = this.r.I16();
    if (this.r.peekBits(64) === 0x89504E47) { // PNG file
      var tImage = new Image();
      var tBlob = new Blob([this.r.sub(this.r.tell(), pLength - 2)], {type: 'image/png'});
      tImage.src = global.webkitURL.createObjectURL(tBlob);
      this.swf.images[tId] = tImage;
    } else { // JPEG file
      this.swf.images[tId] = getJPEG(this, pLength - 2);
    }
  }

  function defineBitsJpeg3(pLength) {
    var tId = this.r.I16();
    var tAlphaOffset = this.r.I32();
    if (this.r.peekBits(64) === 0x89504E47) { // PNG file
      var tImage = new Image();
      var tBlob = new Blob([this.r.sub(this.r.tell(), tAlphaOffset)], {type: 'image/png'});
      tImage.src = global.webkitURL.createObjectURL(tBlob);
      this.swf.images[tId] = tImage;
    } else { // JPEG file
      this.swf.images[tId] = getJPEG(this, pLength - 2);
      // TODO: Support alpha.
      console.warn('Alpha JPEG');
      this.r.seek(pLength - 6 - tAlphaOffset);
    }
  }

  function getJPEG(pParser, pLength) {
    var tReader = pParser.r;
    var tLastByte = tReader.tell() + pLength;

    var tSOS = null;
    var tAPP0 = new Uint8Array([0xFF, 0xE0, 0x0, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x0, 0x01, 0x01, 0x01, 0x0, 0x48, 0x0, 0x48, 0x0, 0x0]);
    var tSOF0 = null;
    var tSOF2 = null;
    var tDQT = null;
    var tDHT = null;

    while (tReader.tell() < tLastByte) {
      if (tReader.B() !== 0xFF) {
        console.error('Could not read JPEG.');
        return null;
      }

      var tTag = tReader.B();
      var tCurrentByte = tReader.tell() - 2;

      if (tTag === 0xD8 || tTag === 0xD9) { // SOI and EOI
        //ignore
        continue;
      } else if (tTag === 0xDA) { // SOS. No length
        tSOS = tReader.sub(tCurrentByte, tLastByte - tCurrentByte);
        tReader.seek(tLastByte - (tCurrentByte + 2));
      } else {
        var tTagLength = tReader.bp(16) + 2;

        switch (tTag) {
          case 0xE0: // APP0
            tAPP0 = tReader.sub(tCurrentByte, tTagLength);
            break;
          case 0xDB: // DQT
            if (tDQT === null) {
              tDQT = tReader.sub(tCurrentByte, tTagLength);
            } else {
              var tNewDQT = new Uint8Array(tDQT.length + tTagLength);
              tNewDQT.set(tDQT);
              tNewDQT.set(tReader.sub(tCurrentByte, tTagLength), tDQT.length);
              tDQT = tNewDQT;
            }
            break;
          case 0xC4: // DHT
            if (tDHT === null) {
              tDHT = tReader.sub(tCurrentByte, tTagLength);
            } else {
              var tNewDHT = new Uint8Array(tDHT.length + tTagLength);
              tNewDHT.set(tDHT);
              tNewDHT.set(tReader.sub(tCurrentByte, tTagLength), tDHT.length);
              tDHT = tNewDHT;
            }
            break;
          case 0xC0: // SOF0
            tSOF0 = tReader.sub(tCurrentByte, tTagLength);
            break;
          case 0xC2: // SOF2
            tSOF2 = tReader.sub(tCurrentByte, tTagLength);
            break;
          default:
            break;
        }

        tReader.seek(tTagLength - 4);
      }
    }

    if (tDQT === null) tDQT = pParser.swf.jpegTableDQT;
    if (tDHT === null) tDHT = pParser.swf.jpegTableDHT;
    var tSOF = tSOF0 !== null ? tSOF0 : tSOF2;
    var tData = new Blob(
      [
        new Uint8Array([0xFF, 0xD8]),
        tAPP0,
        tSOF,
        tDQT,
        tDHT,
        tSOS
      ],
      {
        type: 'image/jpeg'
      }
    );

    var tImage = new Image();
    tImage.src = global.webkitURL.createObjectURL(tData);

    return tImage;
  }

  function defineJpegTable(pLength) {
    var tReader = this.r;
    var tDQT = null;
    var tDHT = null;
    var tLastByte = tReader.tell() + pLength;

    while (tReader.tell() < tLastByte) {
      if (tReader.B() !== 0xFF) {
        console.error('Could not read JPEG Table');
        return;
      }

      var tTag = tReader.B();
      if (tTag === 0xD8 || tTag === 0xD9) {
        continue;
      }

      var tLength = tReader.bp(16);
      tReader.a();

      switch (tTag) {
        case 0xDB: // DQT
          if (tDQT === null) {
            tDQT = tReader.sub(tReader.tell() - 3, tLength + 2);
          } else {
            var tNewDQT = new Uint8Array(tDQT.length + tLength + 2);
            tNewDQT.set(tDQT);
            tNewDQT.set(tReader.sub(tReader.tell() - 3, tLength + 2), tDQT.length);
            tDQT = tNewDQT;
          }
          break;
        case 0xC4: // DHT
          if (tDHT === null) {
            tDHT = tReader.sub(tReader.tell() - 3, tLength + 2);
          } else {
            var tNewDHT = new Uint8Array(tDHT.length + tLength + 2);
            tNewDHT.set(tDHT);
            tNewDHT.set(tReader.sub(tReader.tell() - 3, tLength + 2), tDHT.length);
            tDHT = tNewDHT;
          }
          break;
        default:
          console.warn('Unknown JPEG Table chunk.');
          break;
      }

      tReader.seek(tLength - 2);
    }

    this.swf.jpegTableDQT = tDQT;
    this.swf.jpegTableDHT = tDHT;
  }

}(this));
