/**
 * @author Yoshihiro Yamazaki
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.structs.EditText = EditText;

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

}(this));
