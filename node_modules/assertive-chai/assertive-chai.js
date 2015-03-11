/*jslint indent:2. node:true*/
/*global define, require*/ // AMD + Require.JS

// UMD pattern: https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['assert'], function (assert) {
      return (root.chai = factory(assert));
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('assert'));
  } else {
    root.chai = factory(root.assert);
  }
}(this, function (assert) {
  'use strict';

  var chai, natives, typeOf;

  // Array.prototype.indexOf poly-fill
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      var length;
      if ( this === undefined || this === null ) {
        throw new TypeError( '"this" is null or not defined' );
      }
      length = this.length >>> 0; // Hack to convert object.length to a UInt32
      fromIndex = +fromIndex || 0;
      if (Math.abs(fromIndex) === Infinity) {
        fromIndex = 0;
      }
      if (fromIndex < 0) {
        fromIndex += length;
        if (fromIndex < 0) {
          fromIndex = 0;
        }
      }
      for (;fromIndex < length; fromIndex++) {
        if (this[fromIndex] === searchElement) {
          return fromIndex;
        }
      }
      return -1;
    };
  }

  // Array.prototype.map poly-fill
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

  if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisArg */) {
      "use strict";
      if (this === void 0 || this === null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== "function") {
        throw new TypeError();
      }
      var res = new Array(len);
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        if (i in t) {
          res[i] = fun.call(thisArg, t[i], i, t);
        }
      }
      return res;
    };
  }

  chai = {};

  // import Node.JS's assertions

  chai.assert = function () {
    return assert.apply(this, arguments);
  };

  chai.assert.equal = assert.equal;
  chai.assert.fail = assert.fail;
  chai.assert.strictEqual = assert.strictEqual;
  chai.assert['throws'] = assert['throws'];

  chai.assert.notDeepEqual = assert.notDeepEqual;
  chai.assert.notEqual = assert.notEqual;
  chai.assert.notFail = assert.notFail;
  chai.assert.notStrictEqual = assert.notStrictEqual;
  chai.assert.doesNotThrow = assert.doesNotThrow;

  chai.assert.ifError = assert.ifError;

  // https://github.com/chaijs/chai/blob/master/lib/chai/utils/type.js

  natives = {
    '[object Arguments]': 'arguments',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object Function]': 'function',
    '[object Number]': 'number',
    '[object RegExp]': 'regexp',
    '[object String]': 'string'
  };

  typeOf = function (obj) {
    var str = Object.prototype.toString.call(obj);
    if (natives[str]) return natives[str];
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (obj === Object(obj)) return 'object';
    return typeof obj;
  };

  // https://github.com/chaijs/chai/blob/master/lib/chai/utils/getPathValue.js

  function _getPathValue (parsed, obj) {
    var tmp = obj
      , res;
    for (var i = 0, l = parsed.length; i < l; i++) {
      var part = parsed[i];
      if (tmp) {
        if ('undefined' !== typeof part.p)
          tmp = tmp[part.p];
        else if ('undefined' !== typeof part.i)
          tmp = tmp[part.i];
        if (i == (l - 1)) res = tmp;
      } else {
        res = undefined;
      }
    }
    return res;
  };

  function parsePath (path) {
    var str = path.replace(/\[/g, '.[')
      , parts = str.match(/(\\\.|[^.]+?)+/g);
    return parts.map(function (value) {
      var re = /\[(\d+)\]$/
        , mArr = re.exec(value)
      if (mArr) return { i: parseFloat(mArr[1], 10) };
      else return { p: value };
    });
  };

  function getPathValue (path, obj) {
    var parsed = parsePath(path);
    return _getPathValue(parsed, obj);
  };

  // implement Chai.JS's assertions

  chai.assert.deepEqual = function (actual, expected, msg) {
    if (typeOf(actual) === 'regexp') {
      actual = actual.toString();
    }
    if (typeOf(actual) === 'date') {
      actual = actual.getTime();
    }
    if (typeOf(expected) === 'regexp') {
      expected = expected.toString();
    }
    if (typeOf(expected) === 'date') {
      expected = expected.getTime();
    }
    return assert.equal(typeOf(actual), typeOf(expected), msg) &&
      assert.deepEqual(actual, expected, msg);
  };

  chai.assert.notDeepEqual = function (actual, expected, msg) {
    if (typeOf(actual) === 'regexp' || typeOf(actual) === 'date') {
      actual = actual.toString();
    }
    if (typeOf(expected) === 'regexp' || typeOf(expected) === 'date') {
      expected = expected.toString();
    }
    try {
      return assert.notEqual(typeOf(actual), typeOf(expected), msg);
    } catch (e) {
      return assert.notDeepEqual(actual, expected, msg);
    }
  };

  chai.assert.isTrue = function (value, msg) {
    return chai.assert.equal(value, true, msg);
  };

  chai.assert.ok = function (value, msg) {
    return chai.assert(!!value, true, msg);
  };

  chai.assert.notOk = function (value, msg) {
    return chai.assert(!value, true, msg);
  };

  chai.assert.isFalse = function (value, msg) {
    return chai.assert.equal(value, false, msg);
  };

  chai.assert.typeOf = function (value, type, msg) {
    return chai.assert.equal(typeOf(value), type, msg);
  };

  chai.assert.notTypeOf = function (value, type, msg) {
    return chai.assert.notEqual(typeOf(value), type, msg);
  };

  chai.assert.instanceOf = function (value, constructor, msg) {
    return chai.assert.isTrue(value instanceof constructor, msg);
  };

  chai.assert.notInstanceOf = function (value, constructor, msg) {
    return chai.assert.isFalse(value instanceof constructor, msg);
  };

  chai.assert.isObject = function (value, msg) {
    return chai.assert.typeOf(value, 'object', msg);
  };

  chai.assert.isNotObject = function (value, msg) {
    return chai.assert.notTypeOf(value, 'object', msg);
  };

  chai.assert.isNull = function (value, msg) {
    return chai.assert.typeOf(value, 'null', msg);
  };

  chai.assert.isNotNull = function (value, msg) {
    return chai.assert.notTypeOf(value, 'null', msg);
  };

  chai.assert.isUndefined = function (value, msg) {
    return chai.assert.typeOf(value, 'undefined', msg);
  };

  chai.assert.isDefined = function (value, msg) {
    return chai.assert.notTypeOf(value, 'undefined', msg);
  };

  chai.assert.isFunction = function (value, msg) {
    return chai.assert.typeOf(value, 'function', msg);
  };

  chai.assert.isNotFunction = function (value, msg) {
    return chai.assert.notTypeOf(value, 'function', msg);
  };

  chai.assert.isArray = function (value, msg) {
    if (Array.isArray) {
      return chai.assert.isTrue(Array.isArray(value), msg);
    }
    return chai.assert.typeOf(value, 'array', msg);
  };

  chai.assert.isNotArray = function (value, msg) {
    if (Array.isArray) {
      return chai.assert.isFalse(Array.isArray(value), msg);
    }
    return chai.assert.notTypeOf(value, 'array', msg);
  };

  chai.assert.isString = function (value, msg) {
    return chai.assert.typeOf(value, 'string', msg);
  };

  chai.assert.isNotString = function (value, msg) {
    return chai.assert.notTypeOf(value, 'string', msg);
  };

  chai.assert.isNumber = function (value, msg) {
    return chai.assert.typeOf(value, 'number', msg);
  };

  chai.assert.isNotNumber = function (value, msg) {
    return chai.assert.notTypeOf(value, 'number', msg);
  };

  chai.assert.isBoolean = function (value, msg) {
    return chai.assert.typeOf(value, 'boolean', msg);
  };

  chai.assert.isNotBoolean = function (value, msg) {
    return chai.assert.notTypeOf(value, 'boolean', msg);
  };

  chai.assert.include = function (haystack, needle, msg) {
    var prop;
    if (typeOf(haystack) === 'object' && typeOf(needle) === 'object') {
      for (prop in needle) {
        if (needle.hasOwnProperty(prop) && haystack.hasOwnProperty(prop)) {
          chai.assert.equal(haystack[prop], needle[prop], msg);
        }
      }
      return;
    }
    return chai.assert.isFunction(haystack.indexOf) &&
      chai.assert.notEqual(haystack.indexOf(needle), -1, msg);
  };

  chai.assert.notInclude = function (haystack, needle, msg) {
    var prop;
    if (typeOf(haystack) === 'object' && typeOf(needle) === 'object') {
      for (prop in needle) {
        if (needle.hasOwnProperty(prop) && haystack.hasOwnProperty(prop)) {
          chai.assert.notEqual(haystack[prop], needle[prop], msg);
        }
      }
      return;
    }
    if (typeOf(haystack) === 'array' && typeOf(haystack) === 'string') {
      return chai.assert.equal(haystack.indexOf(needle), -1, msg);
    }
  };

  chai.assert.lengthOf = function (obj, length, msg) {
    if (obj && typeOf(obj.length) === 'number') {
      return chai.assert.equal(obj.length, length, msg);
    }
  };

  chai.assert.match = function (value, regexp, msg) {
    return chai.assert.instanceOf(regexp, RegExp) &&
      chai.assert.isTrue(regexp.test(value), msg);
  };

  chai.assert.notMatch = function (value, regexp, msg) {
    return chai.assert.instanceOf(regexp, RegExp) &&
      chai.assert.isFalse(regexp.test(value), msg);
  };

  chai.assert.property = function (object, property, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    return chai.assert.isDefined(object[property], msg);
  };

  chai.assert.notProperty = function (object, property, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    return chai.assert.isUndefined(object[property], msg);
  };

  chai.assert.deepProperty = function (object, property, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    return chai.assert.isDefined(getPathValue(property, object), msg);
  };

  chai.assert.notDeepProperty = function (object, property, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    return chai.assert.isUndefined(getPathValue(property, object), msg);
  };

  chai.assert.propertyVal = function (object, property, value, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    chai.assert.isDefined(object[property], msg);
    return chai.assert.equal(object[property], value, msg);
  };

  chai.assert.notPropertyVal = function (object, property, value, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    if (typeOf(object[property]) === 'undefined') {
      return chai.assert.notProperty(object, property, msg);
    }
    return chai.assert.notEqual(object[property], value, msg);
  };

  chai.assert.deepPropertyVal = function (object, property, value, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    return chai.assert.equal(getPathValue(property, object), value, msg);
  };

  chai.assert.deepPropertyNotVal = function (object, property, value, msg) {
    chai.assert.instanceOf(object, Object);
    chai.assert.isString(property);
    return chai.assert.notEqual(getPathValue(property, object), value, msg);
  };

  chai.assert.operator = function (val1, operator, val2, msg) {
    chai.assert.isString(operator);
    switch (operator) {
      case '<':
        return chai.assert.isTrue(val1 < val2, msg);
        break;
      case '<=':
        return chai.assert.isTrue(val1 <= val2, msg);
        break;
      case '>':
        return chai.assert.isTrue(val1 > val2, msg);
        break;
      case '>=':
        return chai.assert.isTrue(val1 >= val2, msg);
        break;
      case '==':
        return chai.assert.isTrue(val1 == val2, msg);
        break;
      case '!=':
        return chai.assert.isTrue(val1 != val2, msg);
        break;
      case '===':
        return chai.assert.isTrue(val1 === val2, msg);
        break;
      case '!==':
        return chai.assert.isTrue(val1 !== val2, msg);
        break;
      default:
        throw new Error('unsupported operator');
    }
  };

  chai.assert.closeTo = function (actual, expected, delta, msg) {
    chai.assert.isNumber(actual);
    chai.assert.isNumber(expected);
    chai.assert.isNumber(delta);
    return chai.assert.isTrue(Math.abs(actual - expected) <= delta, msg);
  };

  chai.assert.sameMembers = function (set1, set2, msg) {
    var length;
    chai.assert.isArray(set1, msg);
    chai.assert.isArray(set2, msg);
    length = set1.length;
    chai.assert.equal(length, set2.length, msg);
    return chai.assert.includeMembers(set1, set2, msg);
  };

  chai.assert.includeMembers = function (superset, subset, msg) {
    var length;
    chai.assert.isArray(superset, msg);
    chai.assert.isArray(subset, msg);
    length = subset.length;
    while (length > 0) {
      length -= 1;
      chai.assert.include(superset, subset[length], msg);
    }
  };

  return chai;
}));
