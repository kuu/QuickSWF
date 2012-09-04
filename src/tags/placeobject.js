/**
 * @author Jason Parrott
 *
 * Copyright (C) 2012 Jason Parrott.
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['4'] = placeObject;
  global.quickswf.Parser.prototype['26'] = placeObject2;

  var Matrix = global.quickswf.structs.Matrix;
  var ColorTransform = global.quickswf.structs.ColorTransform;
  var ClipActions = global.quickswf.structs.ClipActions;

  function placeObject(pLength) {
    var tReader = this.r;
    var tId = tReader.I16();
    var tDepth = tReader.I16();
    var tMatrix = Matrix.load(tReader);
    console.error('PlaceObject1 Encountered!');
  }

  function placeObject2(pLength) {
    var tReader = this.r;

    var tFlags = tReader.B();
    var tDepth = tReader.I16();

    var tPackage = {
      type: '',
      id: -1,
      matrix: null,
      depth: tDepth,
      ratio: 0,
      name: null
    };

    var tColorTransform = null;
    var tClipDepth = 0;

    var tId;
    if (tFlags & (1 << 1)) { // hasCharacter
      tId = tPackage.id = tReader.I16();
    }

    if (tFlags & (1 << 2)) { // hasMatrix
      tPackage.matrix = Matrix.load(tReader);
    }

    if (tFlags & (1 << 3)) { // hasColorTransform
      tColorTransform = ColorTransform.load(tReader, true);
    }

    if (tFlags & (1 << 4)) { // hasRatio
      tPackage.ratio = tReader.I16();
    }

    if (tFlags & (1 << 5)) { // hasName
      tPackage.name = tReader.s().toLowerCase();
    }
    // TODO: Might need to make fake names here like '_unnamedNUMBER' on else

    if (tFlags & (1 << 6)) {
      tClipDepth = tReader.I16();
    }

    var tClipActions = null;
    if (tFlags & 1) {
      //tClipActions = ClipActions.load(tReader, this.swf.version);
      // It's not following the spec....
    }

    var tMove = tFlags & 1;

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

    if (tClipDepth > 0) {
      this.add({
        type: 'clip',
        depth: tDepth,
        clipDepth: tClipDepth,
        clipActions: tClipActions
      });
    }

    if (tColorTransform !== null) {
      this.add({
         type: 'colorTransform',
         depth: tDepth,
         colorTransform: tColorTransform
       });
    }
  }

}(this));
