/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['37'] = defineEditText;

  var Rect = global.quickswf.structs.Rect;
  var RGBA = global.quickswf.structs.RGBA;
  var EditText = global.quickswf.structs.EditText;

  function defineEditText(pLength) {
    parseEditText(this);
  }

  function parseEditText(pParser) {
    var tReader = pParser.r;
    var tId = tReader.I16();
    var tBounds = Rect.load(tReader);
    var tFlags = (tReader.B() << 8) | tReader.B();
    var tFont = null;
    if (tFlags & 0x0100) { // HasFont
      tFont = tReader.I16();
    }
    var tFontClass = null;
    if (tFlags & 0x0080) { // HasFontClass
      tFontClass = tReader.s();
    }
    var tFontHeight = null;
    if (tFlags & 0x0100) { // HasFont
      tFontHeight = tReader.I16();
    }
    var tTextColor = null;
    if (tFlags & 0x0400) { // HasTextColor
      tTextColor = RGBA.load(tReader, true);
    }
    var tMaxLength = null;
    if (tFlags & 0x0200) { // HasMaxLength
      tMaxLength = tReader.I16();
    }
    var tAlign = null;
    var tLeftMargin = null;
    var tRightMargin = null;
    var tIndent = null;
    var tLeading = null;
    if (tFlags & 0x0020) { // HasLayout
      tAlign = tReader.B();
      tLeftMargin = tReader.I16();
      tRightMargin = tReader.I16();
      tIndent = tReader.I16();
      tLeading = tReader.I16();
    }
    var tVariableName = tReader.s();
    var InitialText = null;
    if (tFlags & 0x8000) { // HasText
       InitialText = tReader.s();
    }
    
    var tEditText = EditText.load(tReader);
    tEditText.id = tId;
    tEditText.bounds = tBounds;
    tEditText.flags = tFlags;
    tEditText.font = tFont;
    tEditText.fontclass = tFontClass;
    tEditText.fontheight = tFontHeight;
    tEditText.textcolor = tTextColor;
    tEditText.maxlength = tMaxLength;
    tEditText.align = tAlign;
    tEditText.leftmargin = tLeftMargin;
    tEditText.rightmargin = tRightMargin;
    tEditText.indent = tIndent;
    tEditText.leading = tLeading;
    tEditText.variablename = tVariableName;
    tEditText.initialtext = InitialText;

    pParser.swf.dictionary[tId+ ""] = tEditText;
  }

}(this));
