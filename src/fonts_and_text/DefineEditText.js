/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {
  
  global.quickswf.Parser.prototype['37'] = defineEditText;

  var RECT = global.quickswf.structs.RECT;
  var RGBA = global.quickswf.structs.RGBA;

  /**
   * @constructor
   * @class {quickswf.structs.EditText}
   */
  function EditText() {
    this.id = -1;
    this.bounds = null;
    this.wordwrap = false;
    this.multiline = false;
    this.password = false;
    this.readonly = false;
    this.autosize = false;
    this.noselect = false;
    this.border = false;
    this.wasstatic = false;
    this.html = false;
    this.useoutline = false;
    this.font = 0;
    this.fontclass = null;
    this.fontheight = 0;
    this.textcolor = null;
    this.maxlength = 0;
    this.align = 0;
    this.leftmargin = 0;
    this.rightmargin = 0;
    this.indent = 0;
    this.leading = 0;
    this.variablename = null;
    this.initialtext = null;
    this.sjis = false;
  }

  EditText.prototype.displayListType = 'DefineEditText';

  /**
   * Loads a EditText type.
   * @param {quickswf.Reader} pReader The reader to use.
   * @return {quickswf.structs.EditText} The loaded EditText.
   */
  EditText.load = function(pReader) {
    var tEditText = new EditText();
    return tEditText;
  };

  function defineEditText(pLength) {
    parseEditText(this);
  }

  function parseEditText(pParser) {
    var tReader = pParser.r;
    var tId = tReader.I16();
    var tBounds = RECT.load(tReader);
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
    var tFontId = -1;
    var tFont = null;
    if (tHasFont) {
      tFontId = tReader.I16();
      tFont = pParser.swf.fonts[tFontId + ''];
    }
    var tFontClass = null;
    if (tHasFontClass) {
      tFontClass = tReader.s();
    }
    var tFontHeight = 0;
    if (tHasFont) {
      tFontHeight = tReader.I16();
    }
    var tTextColor = null;
    if (tHasTextColor) {
      tTextColor = RGBA.load(tReader, true);
    }
    var tMaxLength = 0;
    if (tHasMaxLength) {
      tMaxLength = tReader.I16();
    }
    var tAlign = 0;
    var tLeftMargin = 0;
    var tRightMargin = 0;
    var tIndent = 0;
    var tLeading = 0;
    if (tHasLayout) {
      tAlign = tReader.B();
      tLeftMargin = tReader.I16();
      tRightMargin = tReader.I16();
      tIndent = tReader.I16();
      tLeading = tReader.I16();
    }
    var tVariableName = tReader.s();
    var tInitialText = null;
    var tSjis = false;
    if (tHasText) {
      tInitialText = tReader.s(true, pParser.nonUtf8CharDetected);
      if (tInitialText === null) {
        // The string can be conceived as Shit-JIS
        var tLength = tReader.sl();
        var tUint8Array = tReader.sub(tReader.tell(), tLength);
        var tBase64String = global.btoa(global.String.fromCharCode.apply(null, global.Array.prototype.slice.call(tUint8Array, 0)));
        tReader.seek(tLength + 1);
        pParser.swf.mediaLoader.load(tBase64String, tUint8Array, 'text/plain; charset=Shift_JIS');
        tInitialText = tBase64String;
        tSjis = true;
        pParser.nonUtf8CharDetected = true;
        // TODO: As MS Gothic doesn't work on Chrome, we need to find appropreate font family for Japanese chars.
        tFont.name = 'Osaka';
      }
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
    tEditText.font = tFontId;
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
    tEditText.sjis = tSjis;
    pParser.swf.dictionary[tId+ ""] = tEditText;
  }

}(this));
