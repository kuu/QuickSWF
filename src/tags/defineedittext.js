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
  var Conv = global.quickswf.utils.Conv;

  function defineEditText(pLength) {
    parseEditText(this);
  }

  function parseEditText(pParser) {
    var tReader = pParser.r;
    var tId = tReader.I16();
    var tBounds = Rect.load(tReader);
    var tFlags1 = tReader.B();
    var tFlags2 = tReader.B();
    var tHasText      = (tFlags1 & 0x80)?true:false;
    var tWordWrap     = (tFlags1 & 0x40)?true:false;
    var tMultiline    = (tFlags1 & 0x20)?true:false;
    var tPassword     = (tFlags1 & 0x10)?true:false;
    var tReadOnly     = (tFlags1 & 0x08)?true:false;
    var tHasTextColor = (tFlags1 & 0x04)?true:false;
    var tHasMaxLength = (tFlags1 & 0x02)?true:false;
    var tHasFont      = (tFlags1 & 0x01)?true:false;
    var tHasFontClass = (tFlags2 & 0x80)?true:false;
    var tAutoSize     = (tFlags2 & 0x40)?true:false;
    var tHasLayout    = (tFlags2 & 0x20)?true:false;
    var tNoSelect     = (tFlags2 & 0x10)?true:false;
    var tBorder       = (tFlags2 & 0x08)?true:false;
    var tWasStatic    = (tFlags2 & 0x04)?true:false;
    var tHTML         = (tFlags2 & 0x02)?true:false;
    var tUseOutline   = (tFlags2 & 0x01)?true:false;
    var tFont = null;
    if (tHasFont) {
      tFont = tReader.I16();
    }
    var tFontClass = null;
    if (tHasFontClass) {
      tFontClass = tReader.s();
    }
    var tFontHeight = null;
    if (tHasFont) {
      tFontHeight = tReader.I16();
    }
    var tTextColor = null;
    if (tHasTextColor) {
      tTextColor = RGBA.load(tReader, true);
    }
    var tMaxLength = null;
    if (tHasMaxLength) {
      tMaxLength = tReader.I16();
    }
    var tAlign = null;
    var tLeftMargin = null;
    var tRightMargin = null;
    var tIndent = null;
    var tLeading = null;
    if (tHasLayout) {
      tAlign = tReader.B();
      tLeftMargin = tReader.I16();
      tRightMargin = tReader.I16();
      tIndent = tReader.I16();
      tLeading = tReader.I16();
    }
    var tVariableName = tReader.s();
    var tInitialText = null;
    if (tHasText) {
       tInitialText = tReader.s();
    }
    
    var tEditText = EditText.load(tReader);
    tEditText.id = tId;
    tEditText.bounds = tBounds;

    tEditText.wordwrap = tWordWrap;
    tEditText.multiline = tMultiline;
    tEditText.password = tPassword;
    tEditText.readonly = tReadOnly;
    tEditText.autosize = tAutoSize;
    tEditText.noselect = tNoSelect;
    tEditText.border = tBorder;
    tEditText.wasstatic = tWasStatic;
    tEditText.html = tHTML;
    tEditText.useoutline = tUseOutline;
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
    tEditText.initialtext = tInitialText;
    if (!tUseOutline && tInitialText) {
      var tFontObj = pParser.swf.fonts[tFont + ''];
      if (tFontObj && tFontObj.shiftJIS) {
        // Convert initial text to UCS.
        var tConvStr = {
            id: tId,
            data: tEditText,
            complete: false
          };
        Conv(tInitialText, 'Shift_JIS', function(str){
            tEditText.initialtext = str;
            tConvStr.complete = true;
          });
        pParser.swf.convstr[tId+''] = tConvStr;
        return;
      }
    }
    pParser.swf.dictionary[tId+ ""] = tEditText;
  }

}(this));
