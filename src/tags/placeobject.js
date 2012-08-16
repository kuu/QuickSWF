(function(global) {
  
  global.quicktheatre.Parser.prototype['4'] = placeObject
  global.quicktheatre.Parser.prototype['26'] = placeObject2;

  var Matrix = global.quicktheatre.structs.Matrix;
  var ColorTransform = global.quicktheatre.structs.ColorTransform;

  function placeObject(pLength) {
    var tReader = this.r;
    var tId = tReader.I16();
    var tDepth = tReader.I16();
    var tMatrix = Matrix.load(tReader);

    console.log('PlaceObject', tId, tDepth, tMatrix);
  }

  function placeObject2(pLength) {
    var tReader = this.r;

    var tFlags = tReader.B();
    var tDepth = tReader.I16();
    var tId;

    if (tFlags & (1 << 1)) { // hasCharacter
      tId = tReader.I16();
    }

    var tMatrix;
    if (tFlags & (1 << 2)) { // hasMatrix
      tMatrix = Matrix.load(tReader);
    } else {
      tMatrix = new Matrix();
    }

    // THERE MIGHT NEED TO HACK ADJUSTX FOR DEFINETEXT HERE.
    
    var tColorTransform;
    if (tFlags & (1 << 3)) { // hasColorTransform
      tColorTransform = ColorTransform.load(tReader);
    } else {
      tColorTransform = new ColorTransform();
    }

    var tRatio = 0;
    if (tFlags & (1 << 4)) { // hasRatio
      tRatio = tReader.I16();
    }

    var tName = null;
    if (tFlags & (1 << 5)) { // hasName
      tName = tReader.s().toLowerCase();
    } else {
      // TODO: Might need to make fake names here like '_unnamedNUMBER'
    }

    var tClipDepth = 0;
    if (tFlags & (1 << 6)) {
      tClipDepth = tReader.I16();
    }

    var tMove = tFlags & (1);

    if (tMove && tId !== void 0) {
      // TODO: replace the Object
      if (tFlags & (1 << 5)) { // hasMatrix
        // TODO: move the object.
      }
    } else if (!tMove && tId !== void 0) {
      // TODO: add new object.
    } else if (tMove && tId === void 0) {
      // TODO: move object only.
    }

    // TODO: apply the colortransform
    
    if (tRatio !== 0) {
      // TODO: apply the ratio.
    }

    console.log('PlaceObject2', tId, tDepth, tMatrix.toString(), tColorTransform, tRatio, tName, tClipDepth, tMove);
  }

}(this));
