/**
 * @author Yuta Imaya
 *
 * Copyright (C) 2012 QuickSWF project
 * This code is licensed under the zlib license. See LICENSE for details.
 */
(function(global) {

  global.quickswf.utils.Conv = Conv;

/**
 * @param {Array.<number>} sjisCode character code array.
 * @param {string} charset character set.
 * @param {function(string)=} opt_callback function.
 */
function Conv(sjisCode, charset, opt_callback) {
  /** @type {HTMLScriptElement} */
  var script = global.document.createElement('script');
  /** @type {number} */
  var id = Conv.id++;
  /** @type {string} */
  var url;
  /** @type {function(string): Array.<number>} */
  var str2array = Conv.str2array;
  /** @type {Array.<number>} */
  var escapedSjisCode = new Array();
  /** @type {number} */
  var i;
  /** @type {number} */
  var il;

  for (i = 0, il = sjisCode.length; i < il; i++) {
    // escape "\" to "\\"
    if (sjisCode[i] === 0x5c) {
      // 2 Byte code
      if (
        i > 0 &&
        (sjisCode[i-1] >= 0x81 && sjisCode[i-1] <= 0x9f) ||
        (sjisCode[i-1] >= 0xe0 && sjisCode[i-1] <= 0xef)
      ) {
        escapedSjisCode.push(sjisCode[i]);
      } else {
        escapedSjisCode.push(0x5c);
        escapedSjisCode.push(0x5c);
      }
    // escape "'" to "\x27"
    } else if (sjisCode[i] === 0x27) {
      escapedSjisCode.push(0x5c);
      escapedSjisCode.push(0x78);
      escapedSjisCode.push(0x32);
      escapedSjisCode.push(0x37);
    // escape {LF} to "\x0a"
    } else if (sjisCode[i] === 0x0a) {
      escapedSjisCode.push(0x5c);
      escapedSjisCode.push(0x78);
      escapedSjisCode.push(0x30);
      escapedSjisCode.push(0x61);
    // escape {CR} to "\x0d"
    } else if (sjisCode[i] === 0x0d) {
      escapedSjisCode.push(0x5c);
      escapedSjisCode.push(0x78);
      escapedSjisCode.push(0x30);
      escapedSjisCode.push(0x64);
    } else {
      escapedSjisCode.push(sjisCode[i]);
    }
  }
  sjisCode = escapedSjisCode;


  // create data url
  url = [
    'data:text/javascript;base64;charset=', charset, ',',
    global.window.btoa(
      String.fromCharCode.apply(null,
        [].concat(
          str2array('quickswf.utils.Conv.callback(' + id + ",'"),
          sjisCode,
          str2array("');")
        )
     )
   )
  ].join('');

  // append script element
  script.src = url;
  script.setAttribute('charset', charset);
  global.document.head.appendChild(script);

  // append context queue
  Conv.queue.push({
    id: id,
    element: script,
    callback: opt_callback
  });
}

/**
 * @param {string} str string.
 * @return {Array.<number>} character code array.
 */
Conv.str2array = function(str) {
  /** @type {number} */
  var i;
  /** @type {number} */
  var il;
  /** @type {Array.<number>} */
  var array = new Array(str.length);

  for (i = 0, il = str.length; i < il; ++i) {
    array[i] = str.charCodeAt(i);
  }

  return array;
};

/**
 * @param {number} id identifier.
 * @param {string} str converted string.
 */
Conv.callback = function(id, str) {
  /** @type {number} */
  var i;
  /** @type {number} */
  var il;
  /** @type {Array.<Object>} */
  var queue = Conv.queue;
  /** @type {Object} */
  var item;

  for (i = 0, il = queue.length; i < il; ++i) {
    if (queue[i].id === id) {
      item = queue.splice(i, 1)[0];
      break;
    }
  }
  if (item === void 0) {
    throw new Error('unknown id');
  }

  if (typeof item.callback === 'function') {
    item.callback(str);
  }

  global.document.head.removeChild(item.element);
};

/** @type {Array.<Object>} */
Conv.queue = [];

/** @type {number} */
Conv.id = 0;
  
}(this));
