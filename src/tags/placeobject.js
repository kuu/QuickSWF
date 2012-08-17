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

  }

  function placeObject2(pLength) {
    var tReader = this.r;

    var tFlags = tReader.B();
    var tDepth = tReader.I16();

    var tPackage = {
      type: '',
      id: -1,
      matrix: null,
      colorTransform: null,
      depth: tDepth,
      ratio: 0,
      name: null,
      clipDepth: 0
    };

    var tId;
    if (tFlags & (1 << 1)) { // hasCharacter
      tId = tPackage.id = tReader.I16();
    }

    if (tFlags & (1 << 2)) { // hasMatrix
      tPackage.matrix = Matrix.load(tReader);
    } else {
      tPackage.matrix = new Matrix();
    }

    // THERE MIGHT NEED TO HACK ADJUSTX FOR DEFINETEXT HERE.
    
    if (tFlags & (1 << 3)) { // hasColorTransform
      tPackage.colorTransform = ColorTransform.load(tReader, true);
    } else {
      tPackage.colorTransform = new ColorTransform();
    }

    if (tFlags & (1 << 4)) { // hasRatio
      tPackage.ratio = tReader.I16();
    }

    if (tFlags & (1 << 5)) { // hasName
      tPackage.name = tReader.s().toLowerCase();
    } else {
      // TODO: Might need to make fake names here like '_unnamedNUMBER'
    }

    if (tFlags & (1 << 6)) {
      tPackage.clipDepth = tReader.I16();
    }

    var tMove = tFlags & (1);

    if (tMove && tId !== void 0) {
      tPackage.type = 'replace';
      this.add(tPackage);
      if (tFlags & (1 << 5)) { // hasMatrix
        tPackage.type = 'move';
        this.add(tPackage);
      }
    } else if (!tMove && tId !== void 0) {
      tPackage.type = 'add';
      this.add(tPackage);
    } else if (tMove && tId === void 0) {
      tPackage.type = 'move';
      this.add(tPackage);
    }
  }

}(this));
