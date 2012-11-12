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
    ;
  }

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
