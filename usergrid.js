/*! 
 *Licensed to the Apache Software Foundation (ASF) under one
 *or more contributor license agreements.  See the NOTICE file
 *distributed with this work for additional information
 *regarding copyright ownership.  The ASF licenses this file
 *to you under the Apache License, Version 2.0 (the
 *"License"); you may not use this file except in compliance
 *with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 * 
 *Unless required by applicable law or agreed to in writing,
 *software distributed under the License is distributed on an
 *"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *KIND, either express or implied.  See the License for the
 *specific language governing permissions and limitations
 *under the License.
 * 
 * 
 * usergrid@0.11.0 2016-10-09 
 */
(function(global) {
    var name = "Promise", overwrittenName = global[name], exports;
    function Promise() {
        this.complete = false;
        this.result = null;
        this.callbacks = [];
    }
    Promise.prototype.then = function(callback, context) {
        var f = function() {
            return callback.apply(context, arguments);
        };
        if (this.complete) {
            f(this.result);
        } else {
            this.callbacks.push(f);
        }
    };
    Promise.prototype.done = function(result) {
        this.complete = true;
        this.result = result;
        if (this.callbacks) {
            for (var i = 0; i < this.callbacks.length; i++) this.callbacks[i](result);
            this.callbacks.length = 0;
        }
    };
    Promise.join = function(promises) {
        var p = new Promise(), total = promises.length, completed = 0, results = [];
        function notifier(i) {
            return function(result) {
                completed += 1;
                results[i] = result;
                if (completed === total) {
                    p.done(results);
                }
            };
        }
        for (var i = 0; i < total; i++) {
            promises[i]().then(notifier(i));
        }
        return p;
    };
    Promise.chain = function(promises, result) {
        var p = new Promise();
        if (promises === null || promises.length === 0) {
            p.done(result);
        } else {
            promises[0](result).then(function(res) {
                promises.splice(0, 1);
                if (promises) {
                    Promise.chain(promises, res).then(function(r) {
                        p.done(r);
                    });
                } else {
                    p.done(res);
                }
            });
        }
        return p;
    };
    global[name] = Promise;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Promise;
    };
    return global[name];
})(this);

(function() {
    var undefined;
    var VERSION = "4.16.0";
    var LARGE_ARRAY_SIZE = 200;
    var FUNC_ERROR_TEXT = "Expected a function";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = "__lodash_placeholder__";
    var BIND_FLAG = 1, BIND_KEY_FLAG = 2, CURRY_BOUND_FLAG = 4, CURRY_FLAG = 8, CURRY_RIGHT_FLAG = 16, PARTIAL_FLAG = 32, PARTIAL_RIGHT_FLAG = 64, ARY_FLAG = 128, REARG_FLAG = 256, FLIP_FLAG = 512;
    var UNORDERED_COMPARE_FLAG = 1, PARTIAL_COMPARE_FLAG = 2;
    var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
    var HOT_COUNT = 500, HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 1.7976931348623157e308, NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [ [ "ary", ARY_FLAG ], [ "bind", BIND_FLAG ], [ "bindKey", BIND_KEY_FLAG ], [ "curry", CURRY_FLAG ], [ "curryRight", CURRY_RIGHT_FLAG ], [ "flip", FLIP_FLAG ], [ "partial", PARTIAL_FLAG ], [ "partialRight", PARTIAL_RIGHT_FLAG ], [ "rearg", REARG_FLAG ] ];
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", promiseTag = "[object Promise]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g, reUnescapedHtml = /[&<>"'`]/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, reLeadingDot = /^\./, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrim = /^\s+|\s+$/g, reTrimStart = /^\s+/, reTrimEnd = /\s+$/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23", rsComboSymbolsRange = "\\u20d0-\\u20f0", rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
    var rsLowerMisc = "(?:" + rsLower + "|" + rsMisc + ")", rsUpperMisc = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptLowerContr = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptUpperContr = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [ rsNonAstral, rsRegional, rsSurrPair ].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [ rsDingbat, rsRegional, rsSurrPair ].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [ rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral ].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([ rsUpper + "?" + rsLower + "+" + rsOptLowerContr + "(?=" + [ rsBreak, rsUpper, "$" ].join("|") + ")", rsUpperMisc + "+" + rsOptUpperContr + "(?=" + [ rsBreak, rsUpper + rsLowerMisc, "$" ].join("|") + ")", rsUpper + "?" + rsLowerMisc + "+" + rsOptLowerContr, rsUpper + "+" + rsOptUpperContr, rsDigits, rsEmoji ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = [ "Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout" ];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
        "À": "A",
        "Á": "A",
        "Â": "A",
        "Ã": "A",
        "Ä": "A",
        "Å": "A",
        "à": "a",
        "á": "a",
        "â": "a",
        "ã": "a",
        "ä": "a",
        "å": "a",
        "Ç": "C",
        "ç": "c",
        "Ð": "D",
        "ð": "d",
        "È": "E",
        "É": "E",
        "Ê": "E",
        "Ë": "E",
        "è": "e",
        "é": "e",
        "ê": "e",
        "ë": "e",
        "Ì": "I",
        "Í": "I",
        "Î": "I",
        "Ï": "I",
        "ì": "i",
        "í": "i",
        "î": "i",
        "ï": "i",
        "Ñ": "N",
        "ñ": "n",
        "Ò": "O",
        "Ó": "O",
        "Ô": "O",
        "Õ": "O",
        "Ö": "O",
        "Ø": "O",
        "ò": "o",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "ö": "o",
        "ø": "o",
        "Ù": "U",
        "Ú": "U",
        "Û": "U",
        "Ü": "U",
        "ù": "u",
        "ú": "u",
        "û": "u",
        "ü": "u",
        "Ý": "Y",
        "ý": "y",
        "ÿ": "y",
        "Æ": "Ae",
        "æ": "ae",
        "Þ": "Th",
        "þ": "th",
        "ß": "ss",
        "Ā": "A",
        "Ă": "A",
        "Ą": "A",
        "ā": "a",
        "ă": "a",
        "ą": "a",
        "Ć": "C",
        "Ĉ": "C",
        "Ċ": "C",
        "Č": "C",
        "ć": "c",
        "ĉ": "c",
        "ċ": "c",
        "č": "c",
        "Ď": "D",
        "Đ": "D",
        "ď": "d",
        "đ": "d",
        "Ē": "E",
        "Ĕ": "E",
        "Ė": "E",
        "Ę": "E",
        "Ě": "E",
        "ē": "e",
        "ĕ": "e",
        "ė": "e",
        "ę": "e",
        "ě": "e",
        "Ĝ": "G",
        "Ğ": "G",
        "Ġ": "G",
        "Ģ": "G",
        "ĝ": "g",
        "ğ": "g",
        "ġ": "g",
        "ģ": "g",
        "Ĥ": "H",
        "Ħ": "H",
        "ĥ": "h",
        "ħ": "h",
        "Ĩ": "I",
        "Ī": "I",
        "Ĭ": "I",
        "Į": "I",
        "İ": "I",
        "ĩ": "i",
        "ī": "i",
        "ĭ": "i",
        "į": "i",
        "ı": "i",
        "Ĵ": "J",
        "ĵ": "j",
        "Ķ": "K",
        "ķ": "k",
        "ĸ": "k",
        "Ĺ": "L",
        "Ļ": "L",
        "Ľ": "L",
        "Ŀ": "L",
        "Ł": "L",
        "ĺ": "l",
        "ļ": "l",
        "ľ": "l",
        "ŀ": "l",
        "ł": "l",
        "Ń": "N",
        "Ņ": "N",
        "Ň": "N",
        "Ŋ": "N",
        "ń": "n",
        "ņ": "n",
        "ň": "n",
        "ŋ": "n",
        "Ō": "O",
        "Ŏ": "O",
        "Ő": "O",
        "ō": "o",
        "ŏ": "o",
        "ő": "o",
        "Ŕ": "R",
        "Ŗ": "R",
        "Ř": "R",
        "ŕ": "r",
        "ŗ": "r",
        "ř": "r",
        "Ś": "S",
        "Ŝ": "S",
        "Ş": "S",
        "Š": "S",
        "ś": "s",
        "ŝ": "s",
        "ş": "s",
        "š": "s",
        "Ţ": "T",
        "Ť": "T",
        "Ŧ": "T",
        "ţ": "t",
        "ť": "t",
        "ŧ": "t",
        "Ũ": "U",
        "Ū": "U",
        "Ŭ": "U",
        "Ů": "U",
        "Ű": "U",
        "Ų": "U",
        "ũ": "u",
        "ū": "u",
        "ŭ": "u",
        "ů": "u",
        "ű": "u",
        "ų": "u",
        "Ŵ": "W",
        "ŵ": "w",
        "Ŷ": "Y",
        "ŷ": "y",
        "Ÿ": "Y",
        "Ź": "Z",
        "Ż": "Z",
        "Ž": "Z",
        "ź": "z",
        "ż": "z",
        "ž": "z",
        "Ĳ": "IJ",
        "ĳ": "ij",
        "Œ": "Oe",
        "œ": "oe",
        "ŉ": "'n",
        "ſ": "s"
    };
    var htmlEscapes = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    var htmlUnescapes = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
    };
    var stringEscapes = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
    };
    var freeParseFloat = parseFloat, freeParseInt = parseInt;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
        try {
            return freeProcess && freeProcess.binding("util");
        } catch (e) {}
    }();
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function addMapEntry(map, pair) {
        map.set(pair[0], pair[1]);
        return map;
    }
    function addSetEntry(set, value) {
        set.add(value);
        return set;
    }
    function apply(func, thisArg, args) {
        switch (args.length) {
          case 0:
            return func.call(thisArg);

          case 1:
            return func.call(thisArg, args[0]);

          case 2:
            return func.call(thisArg, args[0], args[1]);

          case 3:
            return func.call(thisArg, args[0], args[1], args[2]);
        }
        return func.apply(thisArg, args);
    }
    function arrayAggregator(array, setter, iteratee, accumulator) {
        var index = -1, length = array ? array.length : 0;
        while (++index < length) {
            var value = array[index];
            setter(accumulator, value, iteratee(value), array);
        }
        return accumulator;
    }
    function arrayEach(array, iteratee) {
        var index = -1, length = array ? array.length : 0;
        while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    }
    function arrayEachRight(array, iteratee) {
        var length = array ? array.length : 0;
        while (length--) {
            if (iteratee(array[length], length, array) === false) {
                break;
            }
        }
        return array;
    }
    function arrayEvery(array, predicate) {
        var index = -1, length = array ? array.length : 0;
        while (++index < length) {
            if (!predicate(array[index], index, array)) {
                return false;
            }
        }
        return true;
    }
    function arrayFilter(array, predicate) {
        var index = -1, length = array ? array.length : 0, resIndex = 0, result = [];
        while (++index < length) {
            var value = array[index];
            if (predicate(value, index, array)) {
                result[resIndex++] = value;
            }
        }
        return result;
    }
    function arrayIncludes(array, value) {
        var length = array ? array.length : 0;
        return !!length && baseIndexOf(array, value, 0) > -1;
    }
    function arrayIncludesWith(array, value, comparator) {
        var index = -1, length = array ? array.length : 0;
        while (++index < length) {
            if (comparator(value, array[index])) {
                return true;
            }
        }
        return false;
    }
    function arrayMap(array, iteratee) {
        var index = -1, length = array ? array.length : 0, result = Array(length);
        while (++index < length) {
            result[index] = iteratee(array[index], index, array);
        }
        return result;
    }
    function arrayPush(array, values) {
        var index = -1, length = values.length, offset = array.length;
        while (++index < length) {
            array[offset + index] = values[index];
        }
        return array;
    }
    function arrayReduce(array, iteratee, accumulator, initAccum) {
        var index = -1, length = array ? array.length : 0;
        if (initAccum && length) {
            accumulator = array[++index];
        }
        while (++index < length) {
            accumulator = iteratee(accumulator, array[index], index, array);
        }
        return accumulator;
    }
    function arrayReduceRight(array, iteratee, accumulator, initAccum) {
        var length = array ? array.length : 0;
        if (initAccum && length) {
            accumulator = array[--length];
        }
        while (length--) {
            accumulator = iteratee(accumulator, array[length], length, array);
        }
        return accumulator;
    }
    function arraySome(array, predicate) {
        var index = -1, length = array ? array.length : 0;
        while (++index < length) {
            if (predicate(array[index], index, array)) {
                return true;
            }
        }
        return false;
    }
    var asciiSize = baseProperty("length");
    function asciiToArray(string) {
        return string.split("");
    }
    function asciiWords(string) {
        return string.match(reAsciiWord) || [];
    }
    function baseFindKey(collection, predicate, eachFunc) {
        var result;
        eachFunc(collection, function(value, key, collection) {
            if (predicate(value, key, collection)) {
                result = key;
                return false;
            }
        });
        return result;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
        var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
        while (fromRight ? index-- : ++index < length) {
            if (predicate(array[index], index, array)) {
                return index;
            }
        }
        return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
        return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    function baseIndexOfWith(array, value, fromIndex, comparator) {
        var index = fromIndex - 1, length = array.length;
        while (++index < length) {
            if (comparator(array[index], value)) {
                return index;
            }
        }
        return -1;
    }
    function baseIsNaN(value) {
        return value !== value;
    }
    function baseMean(array, iteratee) {
        var length = array ? array.length : 0;
        return length ? baseSum(array, iteratee) / length : NAN;
    }
    function baseProperty(key) {
        return function(object) {
            return object == null ? undefined : object[key];
        };
    }
    function basePropertyOf(object) {
        return function(key) {
            return object == null ? undefined : object[key];
        };
    }
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
        eachFunc(collection, function(value, index, collection) {
            accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection);
        });
        return accumulator;
    }
    function baseSortBy(array, comparer) {
        var length = array.length;
        array.sort(comparer);
        while (length--) {
            array[length] = array[length].value;
        }
        return array;
    }
    function baseSum(array, iteratee) {
        var result, index = -1, length = array.length;
        while (++index < length) {
            var current = iteratee(array[index]);
            if (current !== undefined) {
                result = result === undefined ? current : result + current;
            }
        }
        return result;
    }
    function baseTimes(n, iteratee) {
        var index = -1, result = Array(n);
        while (++index < n) {
            result[index] = iteratee(index);
        }
        return result;
    }
    function baseToPairs(object, props) {
        return arrayMap(props, function(key) {
            return [ key, object[key] ];
        });
    }
    function baseUnary(func) {
        return function(value) {
            return func(value);
        };
    }
    function baseValues(object, props) {
        return arrayMap(props, function(key) {
            return object[key];
        });
    }
    function cacheHas(cache, key) {
        return cache.has(key);
    }
    function charsStartIndex(strSymbols, chrSymbols) {
        var index = -1, length = strSymbols.length;
        while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
        return index;
    }
    function charsEndIndex(strSymbols, chrSymbols) {
        var index = strSymbols.length;
        while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
        return index;
    }
    function countHolders(array, placeholder) {
        var length = array.length, result = 0;
        while (length--) {
            if (array[length] === placeholder) {
                ++result;
            }
        }
        return result;
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    function escapeStringChar(chr) {
        return "\\" + stringEscapes[chr];
    }
    function getValue(object, key) {
        return object == null ? undefined : object[key];
    }
    function hasUnicode(string) {
        return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
        return reHasUnicodeWord.test(string);
    }
    function iteratorToArray(iterator) {
        var data, result = [];
        while (!(data = iterator.next()).done) {
            result.push(data.value);
        }
        return result;
    }
    function mapToArray(map) {
        var index = -1, result = Array(map.size);
        map.forEach(function(value, key) {
            result[++index] = [ key, value ];
        });
        return result;
    }
    function overArg(func, transform) {
        return function(arg) {
            return func(transform(arg));
        };
    }
    function replaceHolders(array, placeholder) {
        var index = -1, length = array.length, resIndex = 0, result = [];
        while (++index < length) {
            var value = array[index];
            if (value === placeholder || value === PLACEHOLDER) {
                array[index] = PLACEHOLDER;
                result[resIndex++] = index;
            }
        }
        return result;
    }
    function setToArray(set) {
        var index = -1, result = Array(set.size);
        set.forEach(function(value) {
            result[++index] = value;
        });
        return result;
    }
    function setToPairs(set) {
        var index = -1, result = Array(set.size);
        set.forEach(function(value) {
            result[++index] = [ value, value ];
        });
        return result;
    }
    function strictIndexOf(array, value, fromIndex) {
        var index = fromIndex - 1, length = array.length;
        while (++index < length) {
            if (array[index] === value) {
                return index;
            }
        }
        return -1;
    }
    function strictLastIndexOf(array, value, fromIndex) {
        var index = fromIndex + 1;
        while (index--) {
            if (array[index] === value) {
                return index;
            }
        }
        return index;
    }
    function stringSize(string) {
        return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    function stringToArray(string) {
        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
    function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
            ++result;
        }
        return result;
    }
    function unicodeToArray(string) {
        return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
        return string.match(reUnicodeWord) || [];
    }
    function runInContext(context) {
        context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
        var Array = context.Array, Date = context.Date, Error = context.Error, Function = context.Function, Math = context.Math, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError;
        var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
        var coreJsData = context["__core-js_shared__"];
        var maskSrcKey = function() {
            var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
            return uid ? "Symbol(src)_1." + uid : "";
        }();
        var funcToString = funcProto.toString;
        var hasOwnProperty = objectProto.hasOwnProperty;
        var idCounter = 0;
        var objectCtorString = funcToString.call(Object);
        var objectToString = objectProto.toString;
        var oldDash = root._;
        var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
        var Buffer = moduleExports ? context.Buffer : undefined, Symbol = context.Symbol, Uint8Array = context.Uint8Array, defineProperty = Object.defineProperty, getPrototype = overArg(Object.getPrototypeOf, Object), iteratorSymbol = Symbol ? Symbol.iterator : undefined, objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;
        var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date && Date.now !== root.Date.now && Date.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
        var nativeCeil = Math.ceil, nativeFloor = Math.floor, nativeGetSymbols = Object.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object.keys, Object), nativeMax = Math.max, nativeMin = Math.min, nativeNow = Date.now, nativeParseInt = context.parseInt, nativeRandom = Math.random, nativeReverse = arrayProto.reverse;
        var DataView = getNative(context, "DataView"), Map = getNative(context, "Map"), Promise = getNative(context, "Promise"), Set = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object, "create"), nativeDefineProperty = getNative(Object, "defineProperty");
        var metaMap = WeakMap && new WeakMap();
        var realNames = {};
        var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
        var symbolProto = Symbol ? Symbol.prototype : undefined, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined, symbolToString = symbolProto ? symbolProto.toString : undefined;
        function lodash(value) {
            if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
                if (value instanceof LodashWrapper) {
                    return value;
                }
                if (hasOwnProperty.call(value, "__wrapped__")) {
                    return wrapperClone(value);
                }
            }
            return new LodashWrapper(value);
        }
        function baseLodash() {}
        function LodashWrapper(value, chainAll) {
            this.__wrapped__ = value;
            this.__actions__ = [];
            this.__chain__ = !!chainAll;
            this.__index__ = 0;
            this.__values__ = undefined;
        }
        lodash.templateSettings = {
            escape: reEscape,
            evaluate: reEvaluate,
            interpolate: reInterpolate,
            variable: "",
            imports: {
                _: lodash
            }
        };
        lodash.prototype = baseLodash.prototype;
        lodash.prototype.constructor = lodash;
        LodashWrapper.prototype = baseCreate(baseLodash.prototype);
        LodashWrapper.prototype.constructor = LodashWrapper;
        function LazyWrapper(value) {
            this.__wrapped__ = value;
            this.__actions__ = [];
            this.__dir__ = 1;
            this.__filtered__ = false;
            this.__iteratees__ = [];
            this.__takeCount__ = MAX_ARRAY_LENGTH;
            this.__views__ = [];
        }
        function lazyClone() {
            var result = new LazyWrapper(this.__wrapped__);
            result.__actions__ = copyArray(this.__actions__);
            result.__dir__ = this.__dir__;
            result.__filtered__ = this.__filtered__;
            result.__iteratees__ = copyArray(this.__iteratees__);
            result.__takeCount__ = this.__takeCount__;
            result.__views__ = copyArray(this.__views__);
            return result;
        }
        function lazyReverse() {
            if (this.__filtered__) {
                var result = new LazyWrapper(this);
                result.__dir__ = -1;
                result.__filtered__ = true;
            } else {
                result = this.clone();
                result.__dir__ *= -1;
            }
            return result;
        }
        function lazyValue() {
            var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
            if (!isArr || arrLength < LARGE_ARRAY_SIZE || arrLength == length && takeCount == length) {
                return baseWrapperValue(array, this.__actions__);
            }
            var result = [];
            outer: while (length-- && resIndex < takeCount) {
                index += dir;
                var iterIndex = -1, value = array[index];
                while (++iterIndex < iterLength) {
                    var data = iteratees[iterIndex], iteratee = data.iteratee, type = data.type, computed = iteratee(value);
                    if (type == LAZY_MAP_FLAG) {
                        value = computed;
                    } else if (!computed) {
                        if (type == LAZY_FILTER_FLAG) {
                            continue outer;
                        } else {
                            break outer;
                        }
                    }
                }
                result[resIndex++] = value;
            }
            return result;
        }
        LazyWrapper.prototype = baseCreate(baseLodash.prototype);
        LazyWrapper.prototype.constructor = LazyWrapper;
        function Hash(entries) {
            var index = -1, length = entries ? entries.length : 0;
            this.clear();
            while (++index < length) {
                var entry = entries[index];
                this.set(entry[0], entry[1]);
            }
        }
        function hashClear() {
            this.__data__ = nativeCreate ? nativeCreate(null) : {};
            this.size = 0;
        }
        function hashDelete(key) {
            var result = this.has(key) && delete this.__data__[key];
            this.size -= result ? 1 : 0;
            return result;
        }
        function hashGet(key) {
            var data = this.__data__;
            if (nativeCreate) {
                var result = data[key];
                return result === HASH_UNDEFINED ? undefined : result;
            }
            return hasOwnProperty.call(data, key) ? data[key] : undefined;
        }
        function hashHas(key) {
            var data = this.__data__;
            return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
        }
        function hashSet(key, value) {
            var data = this.__data__;
            this.size += this.has(key) ? 0 : 1;
            data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
            return this;
        }
        Hash.prototype.clear = hashClear;
        Hash.prototype["delete"] = hashDelete;
        Hash.prototype.get = hashGet;
        Hash.prototype.has = hashHas;
        Hash.prototype.set = hashSet;
        function ListCache(entries) {
            var index = -1, length = entries ? entries.length : 0;
            this.clear();
            while (++index < length) {
                var entry = entries[index];
                this.set(entry[0], entry[1]);
            }
        }
        function listCacheClear() {
            this.__data__ = [];
            this.size = 0;
        }
        function listCacheDelete(key) {
            var data = this.__data__, index = assocIndexOf(data, key);
            if (index < 0) {
                return false;
            }
            var lastIndex = data.length - 1;
            if (index == lastIndex) {
                data.pop();
            } else {
                splice.call(data, index, 1);
            }
            --this.size;
            return true;
        }
        function listCacheGet(key) {
            var data = this.__data__, index = assocIndexOf(data, key);
            return index < 0 ? undefined : data[index][1];
        }
        function listCacheHas(key) {
            return assocIndexOf(this.__data__, key) > -1;
        }
        function listCacheSet(key, value) {
            var data = this.__data__, index = assocIndexOf(data, key);
            if (index < 0) {
                ++this.size;
                data.push([ key, value ]);
            } else {
                data[index][1] = value;
            }
            return this;
        }
        ListCache.prototype.clear = listCacheClear;
        ListCache.prototype["delete"] = listCacheDelete;
        ListCache.prototype.get = listCacheGet;
        ListCache.prototype.has = listCacheHas;
        ListCache.prototype.set = listCacheSet;
        function MapCache(entries) {
            var index = -1, length = entries ? entries.length : 0;
            this.clear();
            while (++index < length) {
                var entry = entries[index];
                this.set(entry[0], entry[1]);
            }
        }
        function mapCacheClear() {
            this.size = 0;
            this.__data__ = {
                hash: new Hash(),
                map: new (Map || ListCache)(),
                string: new Hash()
            };
        }
        function mapCacheDelete(key) {
            var result = getMapData(this, key)["delete"](key);
            this.size -= result ? 1 : 0;
            return result;
        }
        function mapCacheGet(key) {
            return getMapData(this, key).get(key);
        }
        function mapCacheHas(key) {
            return getMapData(this, key).has(key);
        }
        function mapCacheSet(key, value) {
            var data = getMapData(this, key), size = data.size;
            data.set(key, value);
            this.size += data.size == size ? 0 : 1;
            return this;
        }
        MapCache.prototype.clear = mapCacheClear;
        MapCache.prototype["delete"] = mapCacheDelete;
        MapCache.prototype.get = mapCacheGet;
        MapCache.prototype.has = mapCacheHas;
        MapCache.prototype.set = mapCacheSet;
        function SetCache(values) {
            var index = -1, length = values ? values.length : 0;
            this.__data__ = new MapCache();
            while (++index < length) {
                this.add(values[index]);
            }
        }
        function setCacheAdd(value) {
            this.__data__.set(value, HASH_UNDEFINED);
            return this;
        }
        function setCacheHas(value) {
            return this.__data__.has(value);
        }
        SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
        SetCache.prototype.has = setCacheHas;
        function Stack(entries) {
            var data = this.__data__ = new ListCache(entries);
            this.size = data.size;
        }
        function stackClear() {
            this.__data__ = new ListCache();
            this.size = 0;
        }
        function stackDelete(key) {
            var data = this.__data__, result = data["delete"](key);
            this.size = data.size;
            return result;
        }
        function stackGet(key) {
            return this.__data__.get(key);
        }
        function stackHas(key) {
            return this.__data__.has(key);
        }
        function stackSet(key, value) {
            var data = this.__data__;
            if (data instanceof ListCache) {
                var pairs = data.__data__;
                if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
                    pairs.push([ key, value ]);
                    this.size = ++data.size;
                    return this;
                }
                data = this.__data__ = new MapCache(pairs);
            }
            data.set(key, value);
            this.size = data.size;
            return this;
        }
        Stack.prototype.clear = stackClear;
        Stack.prototype["delete"] = stackDelete;
        Stack.prototype.get = stackGet;
        Stack.prototype.has = stackHas;
        Stack.prototype.set = stackSet;
        function arrayLikeKeys(value, inherited) {
            var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
            var length = result.length, skipIndexes = !!length;
            for (var key in value) {
                if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
                    result.push(key);
                }
            }
            return result;
        }
        function arraySample(array) {
            var length = array.length;
            return length ? array[baseRandom(0, length - 1)] : undefined;
        }
        function arraySampleSize(array, n) {
            var result = arrayShuffle(array);
            result.length = baseClamp(n, 0, result.length);
            return result;
        }
        function arrayShuffle(array) {
            return shuffleSelf(copyArray(array));
        }
        function assignInDefaults(objValue, srcValue, key, object) {
            if (objValue === undefined || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
                return srcValue;
            }
            return objValue;
        }
        function assignMergeValue(object, key, value) {
            if (value !== undefined && !eq(object[key], value) || typeof key == "number" && value === undefined && !(key in object)) {
                baseAssignValue(object, key, value);
            }
        }
        function assignValue(object, key, value) {
            var objValue = object[key];
            if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
                baseAssignValue(object, key, value);
            }
        }
        function assocIndexOf(array, key) {
            var length = array.length;
            while (length--) {
                if (eq(array[length][0], key)) {
                    return length;
                }
            }
            return -1;
        }
        function baseAggregator(collection, setter, iteratee, accumulator) {
            baseEach(collection, function(value, key, collection) {
                setter(accumulator, value, iteratee(value), collection);
            });
            return accumulator;
        }
        function baseAssign(object, source) {
            return object && copyObject(source, keys(source), object);
        }
        function baseAssignValue(object, key, value) {
            if (key == "__proto__" && defineProperty) {
                defineProperty(object, key, {
                    configurable: true,
                    enumerable: true,
                    value: value,
                    writable: true
                });
            } else {
                object[key] = value;
            }
        }
        function baseAt(object, paths) {
            var index = -1, isNil = object == null, length = paths.length, result = Array(length);
            while (++index < length) {
                result[index] = isNil ? undefined : get(object, paths[index]);
            }
            return result;
        }
        function baseClamp(number, lower, upper) {
            if (number === number) {
                if (upper !== undefined) {
                    number = number <= upper ? number : upper;
                }
                if (lower !== undefined) {
                    number = number >= lower ? number : lower;
                }
            }
            return number;
        }
        function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
            var result;
            if (customizer) {
                result = object ? customizer(value, key, object, stack) : customizer(value);
            }
            if (result !== undefined) {
                return result;
            }
            if (!isObject(value)) {
                return value;
            }
            var isArr = isArray(value);
            if (isArr) {
                result = initCloneArray(value);
                if (!isDeep) {
                    return copyArray(value, result);
                }
            } else {
                var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
                if (isBuffer(value)) {
                    return cloneBuffer(value, isDeep);
                }
                if (tag == objectTag || tag == argsTag || isFunc && !object) {
                    result = initCloneObject(isFunc ? {} : value);
                    if (!isDeep) {
                        return copySymbols(value, baseAssign(result, value));
                    }
                } else {
                    if (!cloneableTags[tag]) {
                        return object ? value : {};
                    }
                    result = initCloneByTag(value, tag, baseClone, isDeep);
                }
            }
            stack || (stack = new Stack());
            var stacked = stack.get(value);
            if (stacked) {
                return stacked;
            }
            stack.set(value, result);
            if (!isArr) {
                var props = isFull ? getAllKeys(value) : keys(value);
            }
            arrayEach(props || value, function(subValue, key) {
                if (props) {
                    key = subValue;
                    subValue = value[key];
                }
                assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
            });
            return result;
        }
        function baseConforms(source) {
            var props = keys(source);
            return function(object) {
                return baseConformsTo(object, source, props);
            };
        }
        function baseConformsTo(object, source, props) {
            var length = props.length;
            if (object == null) {
                return !length;
            }
            object = Object(object);
            while (length--) {
                var key = props[length], predicate = source[key], value = object[key];
                if (value === undefined && !(key in object) || !predicate(value)) {
                    return false;
                }
            }
            return true;
        }
        function baseCreate(proto) {
            return isObject(proto) ? objectCreate(proto) : {};
        }
        function baseDelay(func, wait, args) {
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            return setTimeout(function() {
                func.apply(undefined, args);
            }, wait);
        }
        function baseDifference(array, values, iteratee, comparator) {
            var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
            if (!length) {
                return result;
            }
            if (iteratee) {
                values = arrayMap(values, baseUnary(iteratee));
            }
            if (comparator) {
                includes = arrayIncludesWith;
                isCommon = false;
            } else if (values.length >= LARGE_ARRAY_SIZE) {
                includes = cacheHas;
                isCommon = false;
                values = new SetCache(values);
            }
            outer: while (++index < length) {
                var value = array[index], computed = iteratee ? iteratee(value) : value;
                value = comparator || value !== 0 ? value : 0;
                if (isCommon && computed === computed) {
                    var valuesIndex = valuesLength;
                    while (valuesIndex--) {
                        if (values[valuesIndex] === computed) {
                            continue outer;
                        }
                    }
                    result.push(value);
                } else if (!includes(values, computed, comparator)) {
                    result.push(value);
                }
            }
            return result;
        }
        var baseEach = createBaseEach(baseForOwn);
        var baseEachRight = createBaseEach(baseForOwnRight, true);
        function baseEvery(collection, predicate) {
            var result = true;
            baseEach(collection, function(value, index, collection) {
                result = !!predicate(value, index, collection);
                return result;
            });
            return result;
        }
        function baseExtremum(array, iteratee, comparator) {
            var index = -1, length = array.length;
            while (++index < length) {
                var value = array[index], current = iteratee(value);
                if (current != null && (computed === undefined ? current === current && !isSymbol(current) : comparator(current, computed))) {
                    var computed = current, result = value;
                }
            }
            return result;
        }
        function baseFill(array, value, start, end) {
            var length = array.length;
            start = toInteger(start);
            if (start < 0) {
                start = -start > length ? 0 : length + start;
            }
            end = end === undefined || end > length ? length : toInteger(end);
            if (end < 0) {
                end += length;
            }
            end = start > end ? 0 : toLength(end);
            while (start < end) {
                array[start++] = value;
            }
            return array;
        }
        function baseFilter(collection, predicate) {
            var result = [];
            baseEach(collection, function(value, index, collection) {
                if (predicate(value, index, collection)) {
                    result.push(value);
                }
            });
            return result;
        }
        function baseFlatten(array, depth, predicate, isStrict, result) {
            var index = -1, length = array.length;
            predicate || (predicate = isFlattenable);
            result || (result = []);
            while (++index < length) {
                var value = array[index];
                if (depth > 0 && predicate(value)) {
                    if (depth > 1) {
                        baseFlatten(value, depth - 1, predicate, isStrict, result);
                    } else {
                        arrayPush(result, value);
                    }
                } else if (!isStrict) {
                    result[result.length] = value;
                }
            }
            return result;
        }
        var baseFor = createBaseFor();
        var baseForRight = createBaseFor(true);
        function baseForOwn(object, iteratee) {
            return object && baseFor(object, iteratee, keys);
        }
        function baseForOwnRight(object, iteratee) {
            return object && baseForRight(object, iteratee, keys);
        }
        function baseFunctions(object, props) {
            return arrayFilter(props, function(key) {
                return isFunction(object[key]);
            });
        }
        function baseGet(object, path) {
            path = isKey(path, object) ? [ path ] : castPath(path);
            var index = 0, length = path.length;
            while (object != null && index < length) {
                object = object[toKey(path[index++])];
            }
            return index && index == length ? object : undefined;
        }
        function baseGetAllKeys(object, keysFunc, symbolsFunc) {
            var result = keysFunc(object);
            return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
        }
        function baseGetTag(value) {
            return objectToString.call(value);
        }
        function baseGt(value, other) {
            return value > other;
        }
        function baseHas(object, key) {
            return object != null && hasOwnProperty.call(object, key);
        }
        function baseHasIn(object, key) {
            return object != null && key in Object(object);
        }
        function baseInRange(number, start, end) {
            return number >= nativeMin(start, end) && number < nativeMax(start, end);
        }
        function baseIntersection(arrays, iteratee, comparator) {
            var includes = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array(othLength), maxLength = Infinity, result = [];
            while (othIndex--) {
                var array = arrays[othIndex];
                if (othIndex && iteratee) {
                    array = arrayMap(array, baseUnary(iteratee));
                }
                maxLength = nativeMin(array.length, maxLength);
                caches[othIndex] = !comparator && (iteratee || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined;
            }
            array = arrays[0];
            var index = -1, seen = caches[0];
            outer: while (++index < length && result.length < maxLength) {
                var value = array[index], computed = iteratee ? iteratee(value) : value;
                value = comparator || value !== 0 ? value : 0;
                if (!(seen ? cacheHas(seen, computed) : includes(result, computed, comparator))) {
                    othIndex = othLength;
                    while (--othIndex) {
                        var cache = caches[othIndex];
                        if (!(cache ? cacheHas(cache, computed) : includes(arrays[othIndex], computed, comparator))) {
                            continue outer;
                        }
                    }
                    if (seen) {
                        seen.push(computed);
                    }
                    result.push(value);
                }
            }
            return result;
        }
        function baseInverter(object, setter, iteratee, accumulator) {
            baseForOwn(object, function(value, key, object) {
                setter(accumulator, iteratee(value), key, object);
            });
            return accumulator;
        }
        function baseInvoke(object, path, args) {
            if (!isKey(path, object)) {
                path = castPath(path);
                object = parent(object, path);
                path = last(path);
            }
            var func = object == null ? object : object[toKey(path)];
            return func == null ? undefined : apply(func, object, args);
        }
        function baseIsArrayBuffer(value) {
            return isObjectLike(value) && objectToString.call(value) == arrayBufferTag;
        }
        function baseIsDate(value) {
            return isObjectLike(value) && objectToString.call(value) == dateTag;
        }
        function baseIsEqual(value, other, customizer, bitmask, stack) {
            if (value === other) {
                return true;
            }
            if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
                return value !== value && other !== other;
            }
            return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
        }
        function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
            var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
            if (!objIsArr) {
                objTag = getTag(object);
                objTag = objTag == argsTag ? objectTag : objTag;
            }
            if (!othIsArr) {
                othTag = getTag(other);
                othTag = othTag == argsTag ? objectTag : othTag;
            }
            var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
            if (isSameTag && !objIsObj) {
                stack || (stack = new Stack());
                return objIsArr || isTypedArray(object) ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
            }
            if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
                var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
                if (objIsWrapped || othIsWrapped) {
                    var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
                    stack || (stack = new Stack());
                    return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
                }
            }
            if (!isSameTag) {
                return false;
            }
            stack || (stack = new Stack());
            return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
        }
        function baseIsMap(value) {
            return isObjectLike(value) && getTag(value) == mapTag;
        }
        function baseIsMatch(object, source, matchData, customizer) {
            var index = matchData.length, length = index, noCustomizer = !customizer;
            if (object == null) {
                return !length;
            }
            object = Object(object);
            while (index--) {
                var data = matchData[index];
                if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
                    return false;
                }
            }
            while (++index < length) {
                data = matchData[index];
                var key = data[0], objValue = object[key], srcValue = data[1];
                if (noCustomizer && data[2]) {
                    if (objValue === undefined && !(key in object)) {
                        return false;
                    }
                } else {
                    var stack = new Stack();
                    if (customizer) {
                        var result = customizer(objValue, srcValue, key, object, source, stack);
                    }
                    if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack) : result)) {
                        return false;
                    }
                }
            }
            return true;
        }
        function baseIsNative(value) {
            if (!isObject(value) || isMasked(value)) {
                return false;
            }
            var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
            return pattern.test(toSource(value));
        }
        function baseIsRegExp(value) {
            return isObject(value) && objectToString.call(value) == regexpTag;
        }
        function baseIsSet(value) {
            return isObjectLike(value) && getTag(value) == setTag;
        }
        function baseIsTypedArray(value) {
            return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
        }
        function baseIteratee(value) {
            if (typeof value == "function") {
                return value;
            }
            if (value == null) {
                return identity;
            }
            if (typeof value == "object") {
                return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
            }
            return property(value);
        }
        function baseKeys(object) {
            if (!isPrototype(object)) {
                return nativeKeys(object);
            }
            var result = [];
            for (var key in Object(object)) {
                if (hasOwnProperty.call(object, key) && key != "constructor") {
                    result.push(key);
                }
            }
            return result;
        }
        function baseKeysIn(object) {
            if (!isObject(object)) {
                return nativeKeysIn(object);
            }
            var isProto = isPrototype(object), result = [];
            for (var key in object) {
                if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
                    result.push(key);
                }
            }
            return result;
        }
        function baseLt(value, other) {
            return value < other;
        }
        function baseMap(collection, iteratee) {
            var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
            baseEach(collection, function(value, key, collection) {
                result[++index] = iteratee(value, key, collection);
            });
            return result;
        }
        function baseMatches(source) {
            var matchData = getMatchData(source);
            if (matchData.length == 1 && matchData[0][2]) {
                return matchesStrictComparable(matchData[0][0], matchData[0][1]);
            }
            return function(object) {
                return object === source || baseIsMatch(object, source, matchData);
            };
        }
        function baseMatchesProperty(path, srcValue) {
            if (isKey(path) && isStrictComparable(srcValue)) {
                return matchesStrictComparable(toKey(path), srcValue);
            }
            return function(object) {
                var objValue = get(object, path);
                return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
            };
        }
        function baseMerge(object, source, srcIndex, customizer, stack) {
            if (object === source) {
                return;
            }
            if (!(isArray(source) || isTypedArray(source))) {
                var props = baseKeysIn(source);
            }
            arrayEach(props || source, function(srcValue, key) {
                if (props) {
                    key = srcValue;
                    srcValue = source[key];
                }
                if (isObject(srcValue)) {
                    stack || (stack = new Stack());
                    baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
                } else {
                    var newValue = customizer ? customizer(object[key], srcValue, key + "", object, source, stack) : undefined;
                    if (newValue === undefined) {
                        newValue = srcValue;
                    }
                    assignMergeValue(object, key, newValue);
                }
            });
        }
        function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
            var objValue = object[key], srcValue = source[key], stacked = stack.get(srcValue);
            if (stacked) {
                assignMergeValue(object, key, stacked);
                return;
            }
            var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined;
            var isCommon = newValue === undefined;
            if (isCommon) {
                newValue = srcValue;
                if (isArray(srcValue) || isTypedArray(srcValue)) {
                    if (isArray(objValue)) {
                        newValue = objValue;
                    } else if (isArrayLikeObject(objValue)) {
                        newValue = copyArray(objValue);
                    } else {
                        isCommon = false;
                        newValue = baseClone(srcValue, true);
                    }
                } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
                    if (isArguments(objValue)) {
                        newValue = toPlainObject(objValue);
                    } else if (!isObject(objValue) || srcIndex && isFunction(objValue)) {
                        isCommon = false;
                        newValue = baseClone(srcValue, true);
                    } else {
                        newValue = objValue;
                    }
                } else {
                    isCommon = false;
                }
            }
            if (isCommon) {
                stack.set(srcValue, newValue);
                mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
                stack["delete"](srcValue);
            }
            assignMergeValue(object, key, newValue);
        }
        function baseNth(array, n) {
            var length = array.length;
            if (!length) {
                return;
            }
            n += n < 0 ? length : 0;
            return isIndex(n, length) ? array[n] : undefined;
        }
        function baseOrderBy(collection, iteratees, orders) {
            var index = -1;
            iteratees = arrayMap(iteratees.length ? iteratees : [ identity ], baseUnary(getIteratee()));
            var result = baseMap(collection, function(value, key, collection) {
                var criteria = arrayMap(iteratees, function(iteratee) {
                    return iteratee(value);
                });
                return {
                    criteria: criteria,
                    index: ++index,
                    value: value
                };
            });
            return baseSortBy(result, function(object, other) {
                return compareMultiple(object, other, orders);
            });
        }
        function basePick(object, props) {
            object = Object(object);
            return basePickBy(object, props, function(value, key) {
                return key in object;
            });
        }
        function basePickBy(object, props, predicate) {
            var index = -1, length = props.length, result = {};
            while (++index < length) {
                var key = props[index], value = object[key];
                if (predicate(value, key)) {
                    baseAssignValue(result, key, value);
                }
            }
            return result;
        }
        function basePropertyDeep(path) {
            return function(object) {
                return baseGet(object, path);
            };
        }
        function basePullAll(array, values, iteratee, comparator) {
            var indexOf = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values.length, seen = array;
            if (array === values) {
                values = copyArray(values);
            }
            if (iteratee) {
                seen = arrayMap(array, baseUnary(iteratee));
            }
            while (++index < length) {
                var fromIndex = 0, value = values[index], computed = iteratee ? iteratee(value) : value;
                while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
                    if (seen !== array) {
                        splice.call(seen, fromIndex, 1);
                    }
                    splice.call(array, fromIndex, 1);
                }
            }
            return array;
        }
        function basePullAt(array, indexes) {
            var length = array ? indexes.length : 0, lastIndex = length - 1;
            while (length--) {
                var index = indexes[length];
                if (length == lastIndex || index !== previous) {
                    var previous = index;
                    if (isIndex(index)) {
                        splice.call(array, index, 1);
                    } else if (!isKey(index, array)) {
                        var path = castPath(index), object = parent(array, path);
                        if (object != null) {
                            delete object[toKey(last(path))];
                        }
                    } else {
                        delete array[toKey(index)];
                    }
                }
            }
            return array;
        }
        function baseRandom(lower, upper) {
            return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
        }
        function baseRange(start, end, step, fromRight) {
            var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
            while (length--) {
                result[fromRight ? length : ++index] = start;
                start += step;
            }
            return result;
        }
        function baseRepeat(string, n) {
            var result = "";
            if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
                return result;
            }
            do {
                if (n % 2) {
                    result += string;
                }
                n = nativeFloor(n / 2);
                if (n) {
                    string += string;
                }
            } while (n);
            return result;
        }
        function baseRest(func, start) {
            return setToString(overRest(func, start, identity), func + "");
        }
        function baseSet(object, path, value, customizer) {
            if (!isObject(object)) {
                return object;
            }
            path = isKey(path, object) ? [ path ] : castPath(path);
            var index = -1, length = path.length, lastIndex = length - 1, nested = object;
            while (nested != null && ++index < length) {
                var key = toKey(path[index]), newValue = value;
                if (index != lastIndex) {
                    var objValue = nested[key];
                    newValue = customizer ? customizer(objValue, key, nested) : undefined;
                    if (newValue === undefined) {
                        newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
                    }
                }
                assignValue(nested, key, newValue);
                nested = nested[key];
            }
            return object;
        }
        var baseSetData = !metaMap ? identity : function(func, data) {
            metaMap.set(func, data);
            return func;
        };
        var baseSetToString = !nativeDefineProperty ? identity : function(func, string) {
            return nativeDefineProperty(func, "toString", {
                configurable: true,
                enumerable: false,
                value: constant(string),
                writable: true
            });
        };
        function baseSlice(array, start, end) {
            var index = -1, length = array.length;
            if (start < 0) {
                start = -start > length ? 0 : length + start;
            }
            end = end > length ? length : end;
            if (end < 0) {
                end += length;
            }
            length = start > end ? 0 : end - start >>> 0;
            start >>>= 0;
            var result = Array(length);
            while (++index < length) {
                result[index] = array[index + start];
            }
            return result;
        }
        function baseSome(collection, predicate) {
            var result;
            baseEach(collection, function(value, index, collection) {
                result = predicate(value, index, collection);
                return !result;
            });
            return !!result;
        }
        function baseSortedIndex(array, value, retHighest) {
            var low = 0, high = array ? array.length : low;
            if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
                while (low < high) {
                    var mid = low + high >>> 1, computed = array[mid];
                    if (computed !== null && !isSymbol(computed) && (retHighest ? computed <= value : computed < value)) {
                        low = mid + 1;
                    } else {
                        high = mid;
                    }
                }
                return high;
            }
            return baseSortedIndexBy(array, value, identity, retHighest);
        }
        function baseSortedIndexBy(array, value, iteratee, retHighest) {
            value = iteratee(value);
            var low = 0, high = array ? array.length : 0, valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined;
            while (low < high) {
                var mid = nativeFloor((low + high) / 2), computed = iteratee(array[mid]), othIsDefined = computed !== undefined, othIsNull = computed === null, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
                if (valIsNaN) {
                    var setLow = retHighest || othIsReflexive;
                } else if (valIsUndefined) {
                    setLow = othIsReflexive && (retHighest || othIsDefined);
                } else if (valIsNull) {
                    setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
                } else if (valIsSymbol) {
                    setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
                } else if (othIsNull || othIsSymbol) {
                    setLow = false;
                } else {
                    setLow = retHighest ? computed <= value : computed < value;
                }
                if (setLow) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return nativeMin(high, MAX_ARRAY_INDEX);
        }
        function baseSortedUniq(array, iteratee) {
            var index = -1, length = array.length, resIndex = 0, result = [];
            while (++index < length) {
                var value = array[index], computed = iteratee ? iteratee(value) : value;
                if (!index || !eq(computed, seen)) {
                    var seen = computed;
                    result[resIndex++] = value === 0 ? 0 : value;
                }
            }
            return result;
        }
        function baseToNumber(value) {
            if (typeof value == "number") {
                return value;
            }
            if (isSymbol(value)) {
                return NAN;
            }
            return +value;
        }
        function baseToString(value) {
            if (typeof value == "string") {
                return value;
            }
            if (isSymbol(value)) {
                return symbolToString ? symbolToString.call(value) : "";
            }
            var result = value + "";
            return result == "0" && 1 / value == -INFINITY ? "-0" : result;
        }
        function baseUniq(array, iteratee, comparator) {
            var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
            if (comparator) {
                isCommon = false;
                includes = arrayIncludesWith;
            } else if (length >= LARGE_ARRAY_SIZE) {
                var set = iteratee ? null : createSet(array);
                if (set) {
                    return setToArray(set);
                }
                isCommon = false;
                includes = cacheHas;
                seen = new SetCache();
            } else {
                seen = iteratee ? [] : result;
            }
            outer: while (++index < length) {
                var value = array[index], computed = iteratee ? iteratee(value) : value;
                value = comparator || value !== 0 ? value : 0;
                if (isCommon && computed === computed) {
                    var seenIndex = seen.length;
                    while (seenIndex--) {
                        if (seen[seenIndex] === computed) {
                            continue outer;
                        }
                    }
                    if (iteratee) {
                        seen.push(computed);
                    }
                    result.push(value);
                } else if (!includes(seen, computed, comparator)) {
                    if (seen !== result) {
                        seen.push(computed);
                    }
                    result.push(value);
                }
            }
            return result;
        }
        function baseUnset(object, path) {
            path = isKey(path, object) ? [ path ] : castPath(path);
            object = parent(object, path);
            var key = toKey(last(path));
            return !(object != null && hasOwnProperty.call(object, key)) || delete object[key];
        }
        function baseUpdate(object, path, updater, customizer) {
            return baseSet(object, path, updater(baseGet(object, path)), customizer);
        }
        function baseWhile(array, predicate, isDrop, fromRight) {
            var length = array.length, index = fromRight ? length : -1;
            while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
            return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
        }
        function baseWrapperValue(value, actions) {
            var result = value;
            if (result instanceof LazyWrapper) {
                result = result.value();
            }
            return arrayReduce(actions, function(result, action) {
                return action.func.apply(action.thisArg, arrayPush([ result ], action.args));
            }, result);
        }
        function baseXor(arrays, iteratee, comparator) {
            var index = -1, length = arrays.length;
            while (++index < length) {
                var result = result ? arrayPush(baseDifference(result, arrays[index], iteratee, comparator), baseDifference(arrays[index], result, iteratee, comparator)) : arrays[index];
            }
            return result && result.length ? baseUniq(result, iteratee, comparator) : [];
        }
        function baseZipObject(props, values, assignFunc) {
            var index = -1, length = props.length, valsLength = values.length, result = {};
            while (++index < length) {
                var value = index < valsLength ? values[index] : undefined;
                assignFunc(result, props[index], value);
            }
            return result;
        }
        function castArrayLikeObject(value) {
            return isArrayLikeObject(value) ? value : [];
        }
        function castFunction(value) {
            return typeof value == "function" ? value : identity;
        }
        function castPath(value) {
            return isArray(value) ? value : stringToPath(value);
        }
        var castRest = baseRest;
        function castSlice(array, start, end) {
            var length = array.length;
            end = end === undefined ? length : end;
            return !start && end >= length ? array : baseSlice(array, start, end);
        }
        var clearTimeout = ctxClearTimeout || function(id) {
            return root.clearTimeout(id);
        };
        function cloneBuffer(buffer, isDeep) {
            if (isDeep) {
                return buffer.slice();
            }
            var result = new buffer.constructor(buffer.length);
            buffer.copy(result);
            return result;
        }
        function cloneArrayBuffer(arrayBuffer) {
            var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
            new Uint8Array(result).set(new Uint8Array(arrayBuffer));
            return result;
        }
        function cloneDataView(dataView, isDeep) {
            var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
            return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
        }
        function cloneMap(map, isDeep, cloneFunc) {
            var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
            return arrayReduce(array, addMapEntry, new map.constructor());
        }
        function cloneRegExp(regexp) {
            var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
            result.lastIndex = regexp.lastIndex;
            return result;
        }
        function cloneSet(set, isDeep, cloneFunc) {
            var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
            return arrayReduce(array, addSetEntry, new set.constructor());
        }
        function cloneSymbol(symbol) {
            return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
        }
        function cloneTypedArray(typedArray, isDeep) {
            var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
            return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
        }
        function compareAscending(value, other) {
            if (value !== other) {
                var valIsDefined = value !== undefined, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
                var othIsDefined = other !== undefined, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
                if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
                    return 1;
                }
                if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
                    return -1;
                }
            }
            return 0;
        }
        function compareMultiple(object, other, orders) {
            var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
            while (++index < length) {
                var result = compareAscending(objCriteria[index], othCriteria[index]);
                if (result) {
                    if (index >= ordersLength) {
                        return result;
                    }
                    var order = orders[index];
                    return result * (order == "desc" ? -1 : 1);
                }
            }
            return object.index - other.index;
        }
        function composeArgs(args, partials, holders, isCurried) {
            var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(leftLength + rangeLength), isUncurried = !isCurried;
            while (++leftIndex < leftLength) {
                result[leftIndex] = partials[leftIndex];
            }
            while (++argsIndex < holdersLength) {
                if (isUncurried || argsIndex < argsLength) {
                    result[holders[argsIndex]] = args[argsIndex];
                }
            }
            while (rangeLength--) {
                result[leftIndex++] = args[argsIndex++];
            }
            return result;
        }
        function composeArgsRight(args, partials, holders, isCurried) {
            var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(rangeLength + rightLength), isUncurried = !isCurried;
            while (++argsIndex < rangeLength) {
                result[argsIndex] = args[argsIndex];
            }
            var offset = argsIndex;
            while (++rightIndex < rightLength) {
                result[offset + rightIndex] = partials[rightIndex];
            }
            while (++holdersIndex < holdersLength) {
                if (isUncurried || argsIndex < argsLength) {
                    result[offset + holders[holdersIndex]] = args[argsIndex++];
                }
            }
            return result;
        }
        function copyArray(source, array) {
            var index = -1, length = source.length;
            array || (array = Array(length));
            while (++index < length) {
                array[index] = source[index];
            }
            return array;
        }
        function copyObject(source, props, object, customizer) {
            var isNew = !object;
            object || (object = {});
            var index = -1, length = props.length;
            while (++index < length) {
                var key = props[index];
                var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
                if (newValue === undefined) {
                    newValue = source[key];
                }
                if (isNew) {
                    baseAssignValue(object, key, newValue);
                } else {
                    assignValue(object, key, newValue);
                }
            }
            return object;
        }
        function copySymbols(source, object) {
            return copyObject(source, getSymbols(source), object);
        }
        function createAggregator(setter, initializer) {
            return function(collection, iteratee) {
                var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
                return func(collection, setter, getIteratee(iteratee, 2), accumulator);
            };
        }
        function createAssigner(assigner) {
            return baseRest(function(object, sources) {
                var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined, guard = length > 2 ? sources[2] : undefined;
                customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, 
                customizer) : undefined;
                if (guard && isIterateeCall(sources[0], sources[1], guard)) {
                    customizer = length < 3 ? undefined : customizer;
                    length = 1;
                }
                object = Object(object);
                while (++index < length) {
                    var source = sources[index];
                    if (source) {
                        assigner(object, source, index, customizer);
                    }
                }
                return object;
            });
        }
        function createBaseEach(eachFunc, fromRight) {
            return function(collection, iteratee) {
                if (collection == null) {
                    return collection;
                }
                if (!isArrayLike(collection)) {
                    return eachFunc(collection, iteratee);
                }
                var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
                while (fromRight ? index-- : ++index < length) {
                    if (iteratee(iterable[index], index, iterable) === false) {
                        break;
                    }
                }
                return collection;
            };
        }
        function createBaseFor(fromRight) {
            return function(object, iteratee, keysFunc) {
                var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
                while (length--) {
                    var key = props[fromRight ? length : ++index];
                    if (iteratee(iterable[key], key, iterable) === false) {
                        break;
                    }
                }
                return object;
            };
        }
        function createBind(func, bitmask, thisArg) {
            var isBind = bitmask & BIND_FLAG, Ctor = createCtor(func);
            function wrapper() {
                var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                return fn.apply(isBind ? thisArg : this, arguments);
            }
            return wrapper;
        }
        function createCaseFirst(methodName) {
            return function(string) {
                string = toString(string);
                var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined;
                var chr = strSymbols ? strSymbols[0] : string.charAt(0);
                var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
                return chr[methodName]() + trailing;
            };
        }
        function createCompounder(callback) {
            return function(string) {
                return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
            };
        }
        function createCtor(Ctor) {
            return function() {
                var args = arguments;
                switch (args.length) {
                  case 0:
                    return new Ctor();

                  case 1:
                    return new Ctor(args[0]);

                  case 2:
                    return new Ctor(args[0], args[1]);

                  case 3:
                    return new Ctor(args[0], args[1], args[2]);

                  case 4:
                    return new Ctor(args[0], args[1], args[2], args[3]);

                  case 5:
                    return new Ctor(args[0], args[1], args[2], args[3], args[4]);

                  case 6:
                    return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);

                  case 7:
                    return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                }
                var thisBinding = baseCreate(Ctor.prototype), result = Ctor.apply(thisBinding, args);
                return isObject(result) ? result : thisBinding;
            };
        }
        function createCurry(func, bitmask, arity) {
            var Ctor = createCtor(func);
            function wrapper() {
                var length = arguments.length, args = Array(length), index = length, placeholder = getHolder(wrapper);
                while (index--) {
                    args[index] = arguments[index];
                }
                var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
                length -= holders.length;
                if (length < arity) {
                    return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, undefined, args, holders, undefined, undefined, arity - length);
                }
                var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                return apply(fn, this, args);
            }
            return wrapper;
        }
        function createFind(findIndexFunc) {
            return function(collection, predicate, fromIndex) {
                var iterable = Object(collection);
                if (!isArrayLike(collection)) {
                    var iteratee = getIteratee(predicate, 3);
                    collection = keys(collection);
                    predicate = function(key) {
                        return iteratee(iterable[key], key, iterable);
                    };
                }
                var index = findIndexFunc(collection, predicate, fromIndex);
                return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
            };
        }
        function createFlow(fromRight) {
            return flatRest(function(funcs) {
                var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
                if (fromRight) {
                    funcs.reverse();
                }
                while (index--) {
                    var func = funcs[index];
                    if (typeof func != "function") {
                        throw new TypeError(FUNC_ERROR_TEXT);
                    }
                    if (prereq && !wrapper && getFuncName(func) == "wrapper") {
                        var wrapper = new LodashWrapper([], true);
                    }
                }
                index = wrapper ? index : length;
                while (++index < length) {
                    func = funcs[index];
                    var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined;
                    if (data && isLaziable(data[0]) && data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) && !data[4].length && data[9] == 1) {
                        wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
                    } else {
                        wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
                    }
                }
                return function() {
                    var args = arguments, value = args[0];
                    if (wrapper && args.length == 1 && isArray(value) && value.length >= LARGE_ARRAY_SIZE) {
                        return wrapper.plant(value).value();
                    }
                    var index = 0, result = length ? funcs[index].apply(this, args) : value;
                    while (++index < length) {
                        result = funcs[index].call(this, result);
                    }
                    return result;
                };
            });
        }
        function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
            var isAry = bitmask & ARY_FLAG, isBind = bitmask & BIND_FLAG, isBindKey = bitmask & BIND_KEY_FLAG, isCurried = bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG), isFlip = bitmask & FLIP_FLAG, Ctor = isBindKey ? undefined : createCtor(func);
            function wrapper() {
                var length = arguments.length, args = Array(length), index = length;
                while (index--) {
                    args[index] = arguments[index];
                }
                if (isCurried) {
                    var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
                }
                if (partials) {
                    args = composeArgs(args, partials, holders, isCurried);
                }
                if (partialsRight) {
                    args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
                }
                length -= holdersCount;
                if (isCurried && length < arity) {
                    var newHolders = replaceHolders(args, placeholder);
                    return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, thisArg, args, newHolders, argPos, ary, arity - length);
                }
                var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
                length = args.length;
                if (argPos) {
                    args = reorder(args, argPos);
                } else if (isFlip && length > 1) {
                    args.reverse();
                }
                if (isAry && ary < length) {
                    args.length = ary;
                }
                if (this && this !== root && this instanceof wrapper) {
                    fn = Ctor || createCtor(fn);
                }
                return fn.apply(thisBinding, args);
            }
            return wrapper;
        }
        function createInverter(setter, toIteratee) {
            return function(object, iteratee) {
                return baseInverter(object, setter, toIteratee(iteratee), {});
            };
        }
        function createMathOperation(operator, defaultValue) {
            return function(value, other) {
                var result;
                if (value === undefined && other === undefined) {
                    return defaultValue;
                }
                if (value !== undefined) {
                    result = value;
                }
                if (other !== undefined) {
                    if (result === undefined) {
                        return other;
                    }
                    if (typeof value == "string" || typeof other == "string") {
                        value = baseToString(value);
                        other = baseToString(other);
                    } else {
                        value = baseToNumber(value);
                        other = baseToNumber(other);
                    }
                    result = operator(value, other);
                }
                return result;
            };
        }
        function createOver(arrayFunc) {
            return flatRest(function(iteratees) {
                iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
                return baseRest(function(args) {
                    var thisArg = this;
                    return arrayFunc(iteratees, function(iteratee) {
                        return apply(iteratee, thisArg, args);
                    });
                });
            });
        }
        function createPadding(length, chars) {
            chars = chars === undefined ? " " : baseToString(chars);
            var charsLength = chars.length;
            if (charsLength < 2) {
                return charsLength ? baseRepeat(chars, length) : chars;
            }
            var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
            return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join("") : result.slice(0, length);
        }
        function createPartial(func, bitmask, thisArg, partials) {
            var isBind = bitmask & BIND_FLAG, Ctor = createCtor(func);
            function wrapper() {
                var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                while (++leftIndex < leftLength) {
                    args[leftIndex] = partials[leftIndex];
                }
                while (argsLength--) {
                    args[leftIndex++] = arguments[++argsIndex];
                }
                return apply(fn, isBind ? thisArg : this, args);
            }
            return wrapper;
        }
        function createRange(fromRight) {
            return function(start, end, step) {
                if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
                    end = step = undefined;
                }
                start = toFinite(start);
                if (end === undefined) {
                    end = start;
                    start = 0;
                } else {
                    end = toFinite(end);
                }
                step = step === undefined ? start < end ? 1 : -1 : toFinite(step);
                return baseRange(start, end, step, fromRight);
            };
        }
        function createRelationalOperation(operator) {
            return function(value, other) {
                if (!(typeof value == "string" && typeof other == "string")) {
                    value = toNumber(value);
                    other = toNumber(other);
                }
                return operator(value, other);
            };
        }
        function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
            var isCurry = bitmask & CURRY_FLAG, newHolders = isCurry ? holders : undefined, newHoldersRight = isCurry ? undefined : holders, newPartials = isCurry ? partials : undefined, newPartialsRight = isCurry ? undefined : partials;
            bitmask |= isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG;
            bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);
            if (!(bitmask & CURRY_BOUND_FLAG)) {
                bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
            }
            var newData = [ func, bitmask, thisArg, newPartials, newHolders, newPartialsRight, newHoldersRight, argPos, ary, arity ];
            var result = wrapFunc.apply(undefined, newData);
            if (isLaziable(func)) {
                setData(result, newData);
            }
            result.placeholder = placeholder;
            return setWrapToString(result, func, bitmask);
        }
        function createRound(methodName) {
            var func = Math[methodName];
            return function(number, precision) {
                number = toNumber(number);
                precision = nativeMin(toInteger(precision), 292);
                if (precision) {
                    var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
                    pair = (toString(value) + "e").split("e");
                    return +(pair[0] + "e" + (+pair[1] - precision));
                }
                return func(number);
            };
        }
        var createSet = !(Set && 1 / setToArray(new Set([ , -0 ]))[1] == INFINITY) ? noop : function(values) {
            return new Set(values);
        };
        function createToPairs(keysFunc) {
            return function(object) {
                var tag = getTag(object);
                if (tag == mapTag) {
                    return mapToArray(object);
                }
                if (tag == setTag) {
                    return setToPairs(object);
                }
                return baseToPairs(object, keysFunc(object));
            };
        }
        function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
            var isBindKey = bitmask & BIND_KEY_FLAG;
            if (!isBindKey && typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            var length = partials ? partials.length : 0;
            if (!length) {
                bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
                partials = holders = undefined;
            }
            ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
            arity = arity === undefined ? arity : toInteger(arity);
            length -= holders ? holders.length : 0;
            if (bitmask & PARTIAL_RIGHT_FLAG) {
                var partialsRight = partials, holdersRight = holders;
                partials = holders = undefined;
            }
            var data = isBindKey ? undefined : getData(func);
            var newData = [ func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity ];
            if (data) {
                mergeData(newData, data);
            }
            func = newData[0];
            bitmask = newData[1];
            thisArg = newData[2];
            partials = newData[3];
            holders = newData[4];
            arity = newData[9] = newData[9] == null ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
            if (!arity && bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG)) {
                bitmask &= ~(CURRY_FLAG | CURRY_RIGHT_FLAG);
            }
            if (!bitmask || bitmask == BIND_FLAG) {
                var result = createBind(func, bitmask, thisArg);
            } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {
                result = createCurry(func, bitmask, arity);
            } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {
                result = createPartial(func, bitmask, thisArg, partials);
            } else {
                result = createHybrid.apply(undefined, newData);
            }
            var setter = data ? baseSetData : setData;
            return setWrapToString(setter(result, newData), func, bitmask);
        }
        function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
            var isPartial = bitmask & PARTIAL_COMPARE_FLAG, arrLength = array.length, othLength = other.length;
            if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
                return false;
            }
            var stacked = stack.get(array);
            if (stacked && stack.get(other)) {
                return stacked == other;
            }
            var index = -1, result = true, seen = bitmask & UNORDERED_COMPARE_FLAG ? new SetCache() : undefined;
            stack.set(array, other);
            stack.set(other, array);
            while (++index < arrLength) {
                var arrValue = array[index], othValue = other[index];
                if (customizer) {
                    var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
                }
                if (compared !== undefined) {
                    if (compared) {
                        continue;
                    }
                    result = false;
                    break;
                }
                if (seen) {
                    if (!arraySome(other, function(othValue, othIndex) {
                        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                            return seen.push(othIndex);
                        }
                    })) {
                        result = false;
                        break;
                    }
                } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                    result = false;
                    break;
                }
            }
            stack["delete"](array);
            stack["delete"](other);
            return result;
        }
        function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
            switch (tag) {
              case dataViewTag:
                if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
                    return false;
                }
                object = object.buffer;
                other = other.buffer;

              case arrayBufferTag:
                if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
                    return false;
                }
                return true;

              case boolTag:
              case dateTag:
              case numberTag:
                return eq(+object, +other);

              case errorTag:
                return object.name == other.name && object.message == other.message;

              case regexpTag:
              case stringTag:
                return object == other + "";

              case mapTag:
                var convert = mapToArray;

              case setTag:
                var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
                convert || (convert = setToArray);
                if (object.size != other.size && !isPartial) {
                    return false;
                }
                var stacked = stack.get(object);
                if (stacked) {
                    return stacked == other;
                }
                bitmask |= UNORDERED_COMPARE_FLAG;
                stack.set(object, other);
                var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
                stack["delete"](object);
                return result;

              case symbolTag:
                if (symbolValueOf) {
                    return symbolValueOf.call(object) == symbolValueOf.call(other);
                }
            }
            return false;
        }
        function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
            var isPartial = bitmask & PARTIAL_COMPARE_FLAG, objProps = keys(object), objLength = objProps.length, othProps = keys(other), othLength = othProps.length;
            if (objLength != othLength && !isPartial) {
                return false;
            }
            var index = objLength;
            while (index--) {
                var key = objProps[index];
                if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
                    return false;
                }
            }
            var stacked = stack.get(object);
            if (stacked && stack.get(other)) {
                return stacked == other;
            }
            var result = true;
            stack.set(object, other);
            stack.set(other, object);
            var skipCtor = isPartial;
            while (++index < objLength) {
                key = objProps[index];
                var objValue = object[key], othValue = other[key];
                if (customizer) {
                    var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
                }
                if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
                    result = false;
                    break;
                }
                skipCtor || (skipCtor = key == "constructor");
            }
            if (result && !skipCtor) {
                var objCtor = object.constructor, othCtor = other.constructor;
                if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
                    result = false;
                }
            }
            stack["delete"](object);
            stack["delete"](other);
            return result;
        }
        function flatRest(func) {
            return setToString(overRest(func, undefined, flatten), func + "");
        }
        function getAllKeys(object) {
            return baseGetAllKeys(object, keys, getSymbols);
        }
        function getAllKeysIn(object) {
            return baseGetAllKeys(object, keysIn, getSymbolsIn);
        }
        var getData = !metaMap ? noop : function(func) {
            return metaMap.get(func);
        };
        function getFuncName(func) {
            var result = func.name + "", array = realNames[result], length = hasOwnProperty.call(realNames, result) ? array.length : 0;
            while (length--) {
                var data = array[length], otherFunc = data.func;
                if (otherFunc == null || otherFunc == func) {
                    return data.name;
                }
            }
            return result;
        }
        function getHolder(func) {
            var object = hasOwnProperty.call(lodash, "placeholder") ? lodash : func;
            return object.placeholder;
        }
        function getIteratee() {
            var result = lodash.iteratee || iteratee;
            result = result === iteratee ? baseIteratee : result;
            return arguments.length ? result(arguments[0], arguments[1]) : result;
        }
        function getMapData(map, key) {
            var data = map.__data__;
            return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
        }
        function getMatchData(object) {
            var result = keys(object), length = result.length;
            while (length--) {
                var key = result[length], value = object[key];
                result[length] = [ key, value, isStrictComparable(value) ];
            }
            return result;
        }
        function getNative(object, key) {
            var value = getValue(object, key);
            return baseIsNative(value) ? value : undefined;
        }
        var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;
        var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
            var result = [];
            while (object) {
                arrayPush(result, getSymbols(object));
                object = getPrototype(object);
            }
            return result;
        };
        var getTag = baseGetTag;
        if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
            getTag = function(value) {
                var result = objectToString.call(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : undefined;
                if (ctorString) {
                    switch (ctorString) {
                      case dataViewCtorString:
                        return dataViewTag;

                      case mapCtorString:
                        return mapTag;

                      case promiseCtorString:
                        return promiseTag;

                      case setCtorString:
                        return setTag;

                      case weakMapCtorString:
                        return weakMapTag;
                    }
                }
                return result;
            };
        }
        function getView(start, end, transforms) {
            var index = -1, length = transforms.length;
            while (++index < length) {
                var data = transforms[index], size = data.size;
                switch (data.type) {
                  case "drop":
                    start += size;
                    break;

                  case "dropRight":
                    end -= size;
                    break;

                  case "take":
                    end = nativeMin(end, start + size);
                    break;

                  case "takeRight":
                    start = nativeMax(start, end - size);
                    break;
                }
            }
            return {
                start: start,
                end: end
            };
        }
        function getWrapDetails(source) {
            var match = source.match(reWrapDetails);
            return match ? match[1].split(reSplitDetails) : [];
        }
        function hasPath(object, path, hasFunc) {
            path = isKey(path, object) ? [ path ] : castPath(path);
            var index = -1, length = path.length, result = false;
            while (++index < length) {
                var key = toKey(path[index]);
                if (!(result = object != null && hasFunc(object, key))) {
                    break;
                }
                object = object[key];
            }
            if (result || ++index != length) {
                return result;
            }
            length = object ? object.length : 0;
            return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
        }
        function initCloneArray(array) {
            var length = array.length, result = array.constructor(length);
            if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
                result.index = array.index;
                result.input = array.input;
            }
            return result;
        }
        function initCloneObject(object) {
            return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
        }
        function initCloneByTag(object, tag, cloneFunc, isDeep) {
            var Ctor = object.constructor;
            switch (tag) {
              case arrayBufferTag:
                return cloneArrayBuffer(object);

              case boolTag:
              case dateTag:
                return new Ctor(+object);

              case dataViewTag:
                return cloneDataView(object, isDeep);

              case float32Tag:
              case float64Tag:
              case int8Tag:
              case int16Tag:
              case int32Tag:
              case uint8Tag:
              case uint8ClampedTag:
              case uint16Tag:
              case uint32Tag:
                return cloneTypedArray(object, isDeep);

              case mapTag:
                return cloneMap(object, isDeep, cloneFunc);

              case numberTag:
              case stringTag:
                return new Ctor(object);

              case regexpTag:
                return cloneRegExp(object);

              case setTag:
                return cloneSet(object, isDeep, cloneFunc);

              case symbolTag:
                return cloneSymbol(object);
            }
        }
        function insertWrapDetails(source, details) {
            var length = details.length;
            if (!length) {
                return source;
            }
            var lastIndex = length - 1;
            details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
            details = details.join(length > 2 ? ", " : " ");
            return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
        }
        function isFlattenable(value) {
            return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
        }
        function isIndex(value, length) {
            length = length == null ? MAX_SAFE_INTEGER : length;
            return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
        }
        function isIterateeCall(value, index, object) {
            if (!isObject(object)) {
                return false;
            }
            var type = typeof index;
            if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
                return eq(object[index], value);
            }
            return false;
        }
        function isKey(value, object) {
            if (isArray(value)) {
                return false;
            }
            var type = typeof value;
            if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
                return true;
            }
            return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
        }
        function isKeyable(value) {
            var type = typeof value;
            return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
        }
        function isLaziable(func) {
            var funcName = getFuncName(func), other = lodash[funcName];
            if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
                return false;
            }
            if (func === other) {
                return true;
            }
            var data = getData(other);
            return !!data && func === data[0];
        }
        function isMasked(func) {
            return !!maskSrcKey && maskSrcKey in func;
        }
        var isMaskable = coreJsData ? isFunction : stubFalse;
        function isPrototype(value) {
            var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
            return value === proto;
        }
        function isStrictComparable(value) {
            return value === value && !isObject(value);
        }
        function matchesStrictComparable(key, srcValue) {
            return function(object) {
                if (object == null) {
                    return false;
                }
                return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
            };
        }
        function memoizeCapped(func) {
            var result = memoize(func, function(key) {
                if (cache.size === MAX_MEMOIZE_SIZE) {
                    cache.clear();
                }
                return key;
            });
            var cache = result.cache;
            return result;
        }
        function mergeData(data, source) {
            var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (BIND_FLAG | BIND_KEY_FLAG | ARY_FLAG);
            var isCombo = srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG || srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8] || srcBitmask == (ARY_FLAG | REARG_FLAG) && source[7].length <= source[8] && bitmask == CURRY_FLAG;
            if (!(isCommon || isCombo)) {
                return data;
            }
            if (srcBitmask & BIND_FLAG) {
                data[2] = source[2];
                newBitmask |= bitmask & BIND_FLAG ? 0 : CURRY_BOUND_FLAG;
            }
            var value = source[3];
            if (value) {
                var partials = data[3];
                data[3] = partials ? composeArgs(partials, value, source[4]) : value;
                data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
            }
            value = source[5];
            if (value) {
                partials = data[5];
                data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
                data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
            }
            value = source[7];
            if (value) {
                data[7] = value;
            }
            if (srcBitmask & ARY_FLAG) {
                data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
            }
            if (data[9] == null) {
                data[9] = source[9];
            }
            data[0] = source[0];
            data[1] = newBitmask;
            return data;
        }
        function mergeDefaults(objValue, srcValue, key, object, source, stack) {
            if (isObject(objValue) && isObject(srcValue)) {
                stack.set(srcValue, objValue);
                baseMerge(objValue, srcValue, undefined, mergeDefaults, stack);
                stack["delete"](srcValue);
            }
            return objValue;
        }
        function nativeKeysIn(object) {
            var result = [];
            if (object != null) {
                for (var key in Object(object)) {
                    result.push(key);
                }
            }
            return result;
        }
        function overRest(func, start, transform) {
            start = nativeMax(start === undefined ? func.length - 1 : start, 0);
            return function() {
                var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
                while (++index < length) {
                    array[index] = args[start + index];
                }
                index = -1;
                var otherArgs = Array(start + 1);
                while (++index < start) {
                    otherArgs[index] = args[index];
                }
                otherArgs[start] = transform(array);
                return apply(func, this, otherArgs);
            };
        }
        function parent(object, path) {
            return path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        }
        function reorder(array, indexes) {
            var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
            while (length--) {
                var index = indexes[length];
                array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
            }
            return array;
        }
        var setData = shortOut(baseSetData);
        var setTimeout = ctxSetTimeout || function(func, wait) {
            return root.setTimeout(func, wait);
        };
        var setToString = shortOut(baseSetToString);
        function setWrapToString(wrapper, reference, bitmask) {
            var source = reference + "";
            return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
        }
        function shortOut(func) {
            var count = 0, lastCalled = 0;
            return function() {
                var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
                lastCalled = stamp;
                if (remaining > 0) {
                    if (++count >= HOT_COUNT) {
                        return arguments[0];
                    }
                } else {
                    count = 0;
                }
                return func.apply(undefined, arguments);
            };
        }
        function shuffleSelf(array) {
            var index = -1, length = array.length, lastIndex = length - 1;
            while (++index < length) {
                var rand = baseRandom(index, lastIndex), value = array[rand];
                array[rand] = array[index];
                array[index] = value;
            }
            return array;
        }
        var stringToPath = memoizeCapped(function(string) {
            string = toString(string);
            var result = [];
            if (reLeadingDot.test(string)) {
                result.push("");
            }
            string.replace(rePropName, function(match, number, quote, string) {
                result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
            });
            return result;
        });
        function toKey(value) {
            if (typeof value == "string" || isSymbol(value)) {
                return value;
            }
            var result = value + "";
            return result == "0" && 1 / value == -INFINITY ? "-0" : result;
        }
        function toSource(func) {
            if (func != null) {
                try {
                    return funcToString.call(func);
                } catch (e) {}
                try {
                    return func + "";
                } catch (e) {}
            }
            return "";
        }
        function updateWrapDetails(details, bitmask) {
            arrayEach(wrapFlags, function(pair) {
                var value = "_." + pair[0];
                if (bitmask & pair[1] && !arrayIncludes(details, value)) {
                    details.push(value);
                }
            });
            return details.sort();
        }
        function wrapperClone(wrapper) {
            if (wrapper instanceof LazyWrapper) {
                return wrapper.clone();
            }
            var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
            result.__actions__ = copyArray(wrapper.__actions__);
            result.__index__ = wrapper.__index__;
            result.__values__ = wrapper.__values__;
            return result;
        }
        function chunk(array, size, guard) {
            if (guard ? isIterateeCall(array, size, guard) : size === undefined) {
                size = 1;
            } else {
                size = nativeMax(toInteger(size), 0);
            }
            var length = array ? array.length : 0;
            if (!length || size < 1) {
                return [];
            }
            var index = 0, resIndex = 0, result = Array(nativeCeil(length / size));
            while (index < length) {
                result[resIndex++] = baseSlice(array, index, index += size);
            }
            return result;
        }
        function compact(array) {
            var index = -1, length = array ? array.length : 0, resIndex = 0, result = [];
            while (++index < length) {
                var value = array[index];
                if (value) {
                    result[resIndex++] = value;
                }
            }
            return result;
        }
        function concat() {
            var length = arguments.length;
            if (!length) {
                return [];
            }
            var args = Array(length - 1), array = arguments[0], index = length;
            while (index--) {
                args[index - 1] = arguments[index];
            }
            return arrayPush(isArray(array) ? copyArray(array) : [ array ], baseFlatten(args, 1));
        }
        var difference = baseRest(function(array, values) {
            return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
        });
        var differenceBy = baseRest(function(array, values) {
            var iteratee = last(values);
            if (isArrayLikeObject(iteratee)) {
                iteratee = undefined;
            }
            return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2)) : [];
        });
        var differenceWith = baseRest(function(array, values) {
            var comparator = last(values);
            if (isArrayLikeObject(comparator)) {
                comparator = undefined;
            }
            return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator) : [];
        });
        function drop(array, n, guard) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            n = guard || n === undefined ? 1 : toInteger(n);
            return baseSlice(array, n < 0 ? 0 : n, length);
        }
        function dropRight(array, n, guard) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            n = guard || n === undefined ? 1 : toInteger(n);
            n = length - n;
            return baseSlice(array, 0, n < 0 ? 0 : n);
        }
        function dropRightWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
        }
        function dropWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
        }
        function fill(array, value, start, end) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
                start = 0;
                end = length;
            }
            return baseFill(array, value, start, end);
        }
        function findIndex(array, predicate, fromIndex) {
            var length = array ? array.length : 0;
            if (!length) {
                return -1;
            }
            var index = fromIndex == null ? 0 : toInteger(fromIndex);
            if (index < 0) {
                index = nativeMax(length + index, 0);
            }
            return baseFindIndex(array, getIteratee(predicate, 3), index);
        }
        function findLastIndex(array, predicate, fromIndex) {
            var length = array ? array.length : 0;
            if (!length) {
                return -1;
            }
            var index = length - 1;
            if (fromIndex !== undefined) {
                index = toInteger(fromIndex);
                index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
            }
            return baseFindIndex(array, getIteratee(predicate, 3), index, true);
        }
        function flatten(array) {
            var length = array ? array.length : 0;
            return length ? baseFlatten(array, 1) : [];
        }
        function flattenDeep(array) {
            var length = array ? array.length : 0;
            return length ? baseFlatten(array, INFINITY) : [];
        }
        function flattenDepth(array, depth) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            depth = depth === undefined ? 1 : toInteger(depth);
            return baseFlatten(array, depth);
        }
        function fromPairs(pairs) {
            var index = -1, length = pairs ? pairs.length : 0, result = {};
            while (++index < length) {
                var pair = pairs[index];
                result[pair[0]] = pair[1];
            }
            return result;
        }
        function head(array) {
            return array && array.length ? array[0] : undefined;
        }
        function indexOf(array, value, fromIndex) {
            var length = array ? array.length : 0;
            if (!length) {
                return -1;
            }
            var index = fromIndex == null ? 0 : toInteger(fromIndex);
            if (index < 0) {
                index = nativeMax(length + index, 0);
            }
            return baseIndexOf(array, value, index);
        }
        function initial(array) {
            var length = array ? array.length : 0;
            return length ? baseSlice(array, 0, -1) : [];
        }
        var intersection = baseRest(function(arrays) {
            var mapped = arrayMap(arrays, castArrayLikeObject);
            return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
        });
        var intersectionBy = baseRest(function(arrays) {
            var iteratee = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
            if (iteratee === last(mapped)) {
                iteratee = undefined;
            } else {
                mapped.pop();
            }
            return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee, 2)) : [];
        });
        var intersectionWith = baseRest(function(arrays) {
            var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
            if (comparator === last(mapped)) {
                comparator = undefined;
            } else {
                mapped.pop();
            }
            return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined, comparator) : [];
        });
        function join(array, separator) {
            return array ? nativeJoin.call(array, separator) : "";
        }
        function last(array) {
            var length = array ? array.length : 0;
            return length ? array[length - 1] : undefined;
        }
        function lastIndexOf(array, value, fromIndex) {
            var length = array ? array.length : 0;
            if (!length) {
                return -1;
            }
            var index = length;
            if (fromIndex !== undefined) {
                index = toInteger(fromIndex);
                index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
            }
            return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
        }
        function nth(array, n) {
            return array && array.length ? baseNth(array, toInteger(n)) : undefined;
        }
        var pull = baseRest(pullAll);
        function pullAll(array, values) {
            return array && array.length && values && values.length ? basePullAll(array, values) : array;
        }
        function pullAllBy(array, values, iteratee) {
            return array && array.length && values && values.length ? basePullAll(array, values, getIteratee(iteratee, 2)) : array;
        }
        function pullAllWith(array, values, comparator) {
            return array && array.length && values && values.length ? basePullAll(array, values, undefined, comparator) : array;
        }
        var pullAt = flatRest(function(array, indexes) {
            var length = array ? array.length : 0, result = baseAt(array, indexes);
            basePullAt(array, arrayMap(indexes, function(index) {
                return isIndex(index, length) ? +index : index;
            }).sort(compareAscending));
            return result;
        });
        function remove(array, predicate) {
            var result = [];
            if (!(array && array.length)) {
                return result;
            }
            var index = -1, indexes = [], length = array.length;
            predicate = getIteratee(predicate, 3);
            while (++index < length) {
                var value = array[index];
                if (predicate(value, index, array)) {
                    result.push(value);
                    indexes.push(index);
                }
            }
            basePullAt(array, indexes);
            return result;
        }
        function reverse(array) {
            return array ? nativeReverse.call(array) : array;
        }
        function slice(array, start, end) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            if (end && typeof end != "number" && isIterateeCall(array, start, end)) {
                start = 0;
                end = length;
            } else {
                start = start == null ? 0 : toInteger(start);
                end = end === undefined ? length : toInteger(end);
            }
            return baseSlice(array, start, end);
        }
        function sortedIndex(array, value) {
            return baseSortedIndex(array, value);
        }
        function sortedIndexBy(array, value, iteratee) {
            return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
        }
        function sortedIndexOf(array, value) {
            var length = array ? array.length : 0;
            if (length) {
                var index = baseSortedIndex(array, value);
                if (index < length && eq(array[index], value)) {
                    return index;
                }
            }
            return -1;
        }
        function sortedLastIndex(array, value) {
            return baseSortedIndex(array, value, true);
        }
        function sortedLastIndexBy(array, value, iteratee) {
            return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
        }
        function sortedLastIndexOf(array, value) {
            var length = array ? array.length : 0;
            if (length) {
                var index = baseSortedIndex(array, value, true) - 1;
                if (eq(array[index], value)) {
                    return index;
                }
            }
            return -1;
        }
        function sortedUniq(array) {
            return array && array.length ? baseSortedUniq(array) : [];
        }
        function sortedUniqBy(array, iteratee) {
            return array && array.length ? baseSortedUniq(array, getIteratee(iteratee, 2)) : [];
        }
        function tail(array) {
            var length = array ? array.length : 0;
            return length ? baseSlice(array, 1, length) : [];
        }
        function take(array, n, guard) {
            if (!(array && array.length)) {
                return [];
            }
            n = guard || n === undefined ? 1 : toInteger(n);
            return baseSlice(array, 0, n < 0 ? 0 : n);
        }
        function takeRight(array, n, guard) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            n = guard || n === undefined ? 1 : toInteger(n);
            n = length - n;
            return baseSlice(array, n < 0 ? 0 : n, length);
        }
        function takeRightWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
        }
        function takeWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
        }
        var union = baseRest(function(arrays) {
            return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
        });
        var unionBy = baseRest(function(arrays) {
            var iteratee = last(arrays);
            if (isArrayLikeObject(iteratee)) {
                iteratee = undefined;
            }
            return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
        });
        var unionWith = baseRest(function(arrays) {
            var comparator = last(arrays);
            if (isArrayLikeObject(comparator)) {
                comparator = undefined;
            }
            return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
        });
        function uniq(array) {
            return array && array.length ? baseUniq(array) : [];
        }
        function uniqBy(array, iteratee) {
            return array && array.length ? baseUniq(array, getIteratee(iteratee, 2)) : [];
        }
        function uniqWith(array, comparator) {
            return array && array.length ? baseUniq(array, undefined, comparator) : [];
        }
        function unzip(array) {
            if (!(array && array.length)) {
                return [];
            }
            var length = 0;
            array = arrayFilter(array, function(group) {
                if (isArrayLikeObject(group)) {
                    length = nativeMax(group.length, length);
                    return true;
                }
            });
            return baseTimes(length, function(index) {
                return arrayMap(array, baseProperty(index));
            });
        }
        function unzipWith(array, iteratee) {
            if (!(array && array.length)) {
                return [];
            }
            var result = unzip(array);
            if (iteratee == null) {
                return result;
            }
            return arrayMap(result, function(group) {
                return apply(iteratee, undefined, group);
            });
        }
        var without = baseRest(function(array, values) {
            return isArrayLikeObject(array) ? baseDifference(array, values) : [];
        });
        var xor = baseRest(function(arrays) {
            return baseXor(arrayFilter(arrays, isArrayLikeObject));
        });
        var xorBy = baseRest(function(arrays) {
            var iteratee = last(arrays);
            if (isArrayLikeObject(iteratee)) {
                iteratee = undefined;
            }
            return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
        });
        var xorWith = baseRest(function(arrays) {
            var comparator = last(arrays);
            if (isArrayLikeObject(comparator)) {
                comparator = undefined;
            }
            return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
        });
        var zip = baseRest(unzip);
        function zipObject(props, values) {
            return baseZipObject(props || [], values || [], assignValue);
        }
        function zipObjectDeep(props, values) {
            return baseZipObject(props || [], values || [], baseSet);
        }
        var zipWith = baseRest(function(arrays) {
            var length = arrays.length, iteratee = length > 1 ? arrays[length - 1] : undefined;
            iteratee = typeof iteratee == "function" ? (arrays.pop(), iteratee) : undefined;
            return unzipWith(arrays, iteratee);
        });
        function chain(value) {
            var result = lodash(value);
            result.__chain__ = true;
            return result;
        }
        function tap(value, interceptor) {
            interceptor(value);
            return value;
        }
        function thru(value, interceptor) {
            return interceptor(value);
        }
        var wrapperAt = flatRest(function(paths) {
            var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
                return baseAt(object, paths);
            };
            if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
                return this.thru(interceptor);
            }
            value = value.slice(start, +start + (length ? 1 : 0));
            value.__actions__.push({
                func: thru,
                args: [ interceptor ],
                thisArg: undefined
            });
            return new LodashWrapper(value, this.__chain__).thru(function(array) {
                if (length && !array.length) {
                    array.push(undefined);
                }
                return array;
            });
        });
        function wrapperChain() {
            return chain(this);
        }
        function wrapperCommit() {
            return new LodashWrapper(this.value(), this.__chain__);
        }
        function wrapperNext() {
            if (this.__values__ === undefined) {
                this.__values__ = toArray(this.value());
            }
            var done = this.__index__ >= this.__values__.length, value = done ? undefined : this.__values__[this.__index__++];
            return {
                done: done,
                value: value
            };
        }
        function wrapperToIterator() {
            return this;
        }
        function wrapperPlant(value) {
            var result, parent = this;
            while (parent instanceof baseLodash) {
                var clone = wrapperClone(parent);
                clone.__index__ = 0;
                clone.__values__ = undefined;
                if (result) {
                    previous.__wrapped__ = clone;
                } else {
                    result = clone;
                }
                var previous = clone;
                parent = parent.__wrapped__;
            }
            previous.__wrapped__ = value;
            return result;
        }
        function wrapperReverse() {
            var value = this.__wrapped__;
            if (value instanceof LazyWrapper) {
                var wrapped = value;
                if (this.__actions__.length) {
                    wrapped = new LazyWrapper(this);
                }
                wrapped = wrapped.reverse();
                wrapped.__actions__.push({
                    func: thru,
                    args: [ reverse ],
                    thisArg: undefined
                });
                return new LodashWrapper(wrapped, this.__chain__);
            }
            return this.thru(reverse);
        }
        function wrapperValue() {
            return baseWrapperValue(this.__wrapped__, this.__actions__);
        }
        var countBy = createAggregator(function(result, value, key) {
            if (hasOwnProperty.call(result, key)) {
                ++result[key];
            } else {
                baseAssignValue(result, key, 1);
            }
        });
        function every(collection, predicate, guard) {
            var func = isArray(collection) ? arrayEvery : baseEvery;
            if (guard && isIterateeCall(collection, predicate, guard)) {
                predicate = undefined;
            }
            return func(collection, getIteratee(predicate, 3));
        }
        function filter(collection, predicate) {
            var func = isArray(collection) ? arrayFilter : baseFilter;
            return func(collection, getIteratee(predicate, 3));
        }
        var find = createFind(findIndex);
        var findLast = createFind(findLastIndex);
        function flatMap(collection, iteratee) {
            return baseFlatten(map(collection, iteratee), 1);
        }
        function flatMapDeep(collection, iteratee) {
            return baseFlatten(map(collection, iteratee), INFINITY);
        }
        function flatMapDepth(collection, iteratee, depth) {
            depth = depth === undefined ? 1 : toInteger(depth);
            return baseFlatten(map(collection, iteratee), depth);
        }
        function forEach(collection, iteratee) {
            var func = isArray(collection) ? arrayEach : baseEach;
            return func(collection, getIteratee(iteratee, 3));
        }
        function forEachRight(collection, iteratee) {
            var func = isArray(collection) ? arrayEachRight : baseEachRight;
            return func(collection, getIteratee(iteratee, 3));
        }
        var groupBy = createAggregator(function(result, value, key) {
            if (hasOwnProperty.call(result, key)) {
                result[key].push(value);
            } else {
                baseAssignValue(result, key, [ value ]);
            }
        });
        function includes(collection, value, fromIndex, guard) {
            collection = isArrayLike(collection) ? collection : values(collection);
            fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
            var length = collection.length;
            if (fromIndex < 0) {
                fromIndex = nativeMax(length + fromIndex, 0);
            }
            return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
        }
        var invokeMap = baseRest(function(collection, path, args) {
            var index = -1, isFunc = typeof path == "function", isProp = isKey(path), result = isArrayLike(collection) ? Array(collection.length) : [];
            baseEach(collection, function(value) {
                var func = isFunc ? path : isProp && value != null ? value[path] : undefined;
                result[++index] = func ? apply(func, value, args) : baseInvoke(value, path, args);
            });
            return result;
        });
        var keyBy = createAggregator(function(result, value, key) {
            baseAssignValue(result, key, value);
        });
        function map(collection, iteratee) {
            var func = isArray(collection) ? arrayMap : baseMap;
            return func(collection, getIteratee(iteratee, 3));
        }
        function orderBy(collection, iteratees, orders, guard) {
            if (collection == null) {
                return [];
            }
            if (!isArray(iteratees)) {
                iteratees = iteratees == null ? [] : [ iteratees ];
            }
            orders = guard ? undefined : orders;
            if (!isArray(orders)) {
                orders = orders == null ? [] : [ orders ];
            }
            return baseOrderBy(collection, iteratees, orders);
        }
        var partition = createAggregator(function(result, value, key) {
            result[key ? 0 : 1].push(value);
        }, function() {
            return [ [], [] ];
        });
        function reduce(collection, iteratee, accumulator) {
            var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
            return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
        }
        function reduceRight(collection, iteratee, accumulator) {
            var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
            return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
        }
        function reject(collection, predicate) {
            var func = isArray(collection) ? arrayFilter : baseFilter;
            return func(collection, negate(getIteratee(predicate, 3)));
        }
        function sample(collection) {
            return arraySample(isArrayLike(collection) ? collection : values(collection));
        }
        function sampleSize(collection, n, guard) {
            if (guard ? isIterateeCall(collection, n, guard) : n === undefined) {
                n = 1;
            } else {
                n = toInteger(n);
            }
            return arraySampleSize(isArrayLike(collection) ? collection : values(collection), n);
        }
        function shuffle(collection) {
            return shuffleSelf(isArrayLike(collection) ? copyArray(collection) : values(collection));
        }
        function size(collection) {
            if (collection == null) {
                return 0;
            }
            if (isArrayLike(collection)) {
                return isString(collection) ? stringSize(collection) : collection.length;
            }
            var tag = getTag(collection);
            if (tag == mapTag || tag == setTag) {
                return collection.size;
            }
            return baseKeys(collection).length;
        }
        function some(collection, predicate, guard) {
            var func = isArray(collection) ? arraySome : baseSome;
            if (guard && isIterateeCall(collection, predicate, guard)) {
                predicate = undefined;
            }
            return func(collection, getIteratee(predicate, 3));
        }
        var sortBy = baseRest(function(collection, iteratees) {
            if (collection == null) {
                return [];
            }
            var length = iteratees.length;
            if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
                iteratees = [];
            } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
                iteratees = [ iteratees[0] ];
            }
            return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
        });
        var now = ctxNow || function() {
            return root.Date.now();
        };
        function after(n, func) {
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            n = toInteger(n);
            return function() {
                if (--n < 1) {
                    return func.apply(this, arguments);
                }
            };
        }
        function ary(func, n, guard) {
            n = guard ? undefined : n;
            n = func && n == null ? func.length : n;
            return createWrap(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
        }
        function before(n, func) {
            var result;
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            n = toInteger(n);
            return function() {
                if (--n > 0) {
                    result = func.apply(this, arguments);
                }
                if (n <= 1) {
                    func = undefined;
                }
                return result;
            };
        }
        var bind = baseRest(function(func, thisArg, partials) {
            var bitmask = BIND_FLAG;
            if (partials.length) {
                var holders = replaceHolders(partials, getHolder(bind));
                bitmask |= PARTIAL_FLAG;
            }
            return createWrap(func, bitmask, thisArg, partials, holders);
        });
        var bindKey = baseRest(function(object, key, partials) {
            var bitmask = BIND_FLAG | BIND_KEY_FLAG;
            if (partials.length) {
                var holders = replaceHolders(partials, getHolder(bindKey));
                bitmask |= PARTIAL_FLAG;
            }
            return createWrap(key, bitmask, object, partials, holders);
        });
        function curry(func, arity, guard) {
            arity = guard ? undefined : arity;
            var result = createWrap(func, CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
            result.placeholder = curry.placeholder;
            return result;
        }
        function curryRight(func, arity, guard) {
            arity = guard ? undefined : arity;
            var result = createWrap(func, CURRY_RIGHT_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
            result.placeholder = curryRight.placeholder;
            return result;
        }
        function debounce(func, wait, options) {
            var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            wait = toNumber(wait) || 0;
            if (isObject(options)) {
                leading = !!options.leading;
                maxing = "maxWait" in options;
                maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
                trailing = "trailing" in options ? !!options.trailing : trailing;
            }
            function invokeFunc(time) {
                var args = lastArgs, thisArg = lastThis;
                lastArgs = lastThis = undefined;
                lastInvokeTime = time;
                result = func.apply(thisArg, args);
                return result;
            }
            function leadingEdge(time) {
                lastInvokeTime = time;
                timerId = setTimeout(timerExpired, wait);
                return leading ? invokeFunc(time) : result;
            }
            function remainingWait(time) {
                var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result = wait - timeSinceLastCall;
                return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
            }
            function shouldInvoke(time) {
                var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
                return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
            }
            function timerExpired() {
                var time = now();
                if (shouldInvoke(time)) {
                    return trailingEdge(time);
                }
                timerId = setTimeout(timerExpired, remainingWait(time));
            }
            function trailingEdge(time) {
                timerId = undefined;
                if (trailing && lastArgs) {
                    return invokeFunc(time);
                }
                lastArgs = lastThis = undefined;
                return result;
            }
            function cancel() {
                if (timerId !== undefined) {
                    clearTimeout(timerId);
                }
                lastInvokeTime = 0;
                lastArgs = lastCallTime = lastThis = timerId = undefined;
            }
            function flush() {
                return timerId === undefined ? result : trailingEdge(now());
            }
            function debounced() {
                var time = now(), isInvoking = shouldInvoke(time);
                lastArgs = arguments;
                lastThis = this;
                lastCallTime = time;
                if (isInvoking) {
                    if (timerId === undefined) {
                        return leadingEdge(lastCallTime);
                    }
                    if (maxing) {
                        timerId = setTimeout(timerExpired, wait);
                        return invokeFunc(lastCallTime);
                    }
                }
                if (timerId === undefined) {
                    timerId = setTimeout(timerExpired, wait);
                }
                return result;
            }
            debounced.cancel = cancel;
            debounced.flush = flush;
            return debounced;
        }
        var defer = baseRest(function(func, args) {
            return baseDelay(func, 1, args);
        });
        var delay = baseRest(function(func, wait, args) {
            return baseDelay(func, toNumber(wait) || 0, args);
        });
        function flip(func) {
            return createWrap(func, FLIP_FLAG);
        }
        function memoize(func, resolver) {
            if (typeof func != "function" || resolver && typeof resolver != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            var memoized = function() {
                var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
                if (cache.has(key)) {
                    return cache.get(key);
                }
                var result = func.apply(this, args);
                memoized.cache = cache.set(key, result) || cache;
                return result;
            };
            memoized.cache = new (memoize.Cache || MapCache)();
            return memoized;
        }
        memoize.Cache = MapCache;
        function negate(predicate) {
            if (typeof predicate != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            return function() {
                var args = arguments;
                switch (args.length) {
                  case 0:
                    return !predicate.call(this);

                  case 1:
                    return !predicate.call(this, args[0]);

                  case 2:
                    return !predicate.call(this, args[0], args[1]);

                  case 3:
                    return !predicate.call(this, args[0], args[1], args[2]);
                }
                return !predicate.apply(this, args);
            };
        }
        function once(func) {
            return before(2, func);
        }
        var overArgs = castRest(function(func, transforms) {
            transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
            var funcsLength = transforms.length;
            return baseRest(function(args) {
                var index = -1, length = nativeMin(args.length, funcsLength);
                while (++index < length) {
                    args[index] = transforms[index].call(this, args[index]);
                }
                return apply(func, this, args);
            });
        });
        var partial = baseRest(function(func, partials) {
            var holders = replaceHolders(partials, getHolder(partial));
            return createWrap(func, PARTIAL_FLAG, undefined, partials, holders);
        });
        var partialRight = baseRest(function(func, partials) {
            var holders = replaceHolders(partials, getHolder(partialRight));
            return createWrap(func, PARTIAL_RIGHT_FLAG, undefined, partials, holders);
        });
        var rearg = flatRest(function(func, indexes) {
            return createWrap(func, REARG_FLAG, undefined, undefined, undefined, indexes);
        });
        function rest(func, start) {
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            start = start === undefined ? start : toInteger(start);
            return baseRest(func, start);
        }
        function spread(func, start) {
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            start = start === undefined ? 0 : nativeMax(toInteger(start), 0);
            return baseRest(function(args) {
                var array = args[start], otherArgs = castSlice(args, 0, start);
                if (array) {
                    arrayPush(otherArgs, array);
                }
                return apply(func, this, otherArgs);
            });
        }
        function throttle(func, wait, options) {
            var leading = true, trailing = true;
            if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
            }
            if (isObject(options)) {
                leading = "leading" in options ? !!options.leading : leading;
                trailing = "trailing" in options ? !!options.trailing : trailing;
            }
            return debounce(func, wait, {
                leading: leading,
                maxWait: wait,
                trailing: trailing
            });
        }
        function unary(func) {
            return ary(func, 1);
        }
        function wrap(value, wrapper) {
            wrapper = wrapper == null ? identity : wrapper;
            return partial(wrapper, value);
        }
        function castArray() {
            if (!arguments.length) {
                return [];
            }
            var value = arguments[0];
            return isArray(value) ? value : [ value ];
        }
        function clone(value) {
            return baseClone(value, false, true);
        }
        function cloneWith(value, customizer) {
            return baseClone(value, false, true, customizer);
        }
        function cloneDeep(value) {
            return baseClone(value, true, true);
        }
        function cloneDeepWith(value, customizer) {
            return baseClone(value, true, true, customizer);
        }
        function conformsTo(object, source) {
            return source == null || baseConformsTo(object, source, keys(source));
        }
        function eq(value, other) {
            return value === other || value !== value && other !== other;
        }
        var gt = createRelationalOperation(baseGt);
        var gte = createRelationalOperation(function(value, other) {
            return value >= other;
        });
        function isArguments(value) {
            return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
        }
        var isArray = Array.isArray;
        var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
        function isArrayLike(value) {
            return value != null && isLength(value.length) && !isFunction(value);
        }
        function isArrayLikeObject(value) {
            return isObjectLike(value) && isArrayLike(value);
        }
        function isBoolean(value) {
            return value === true || value === false || isObjectLike(value) && objectToString.call(value) == boolTag;
        }
        var isBuffer = nativeIsBuffer || stubFalse;
        var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
        function isElement(value) {
            return value != null && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
        }
        function isEmpty(value) {
            if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isArguments(value))) {
                return !value.length;
            }
            var tag = getTag(value);
            if (tag == mapTag || tag == setTag) {
                return !value.size;
            }
            if (isPrototype(value)) {
                return !nativeKeys(value).length;
            }
            for (var key in value) {
                if (hasOwnProperty.call(value, key)) {
                    return false;
                }
            }
            return true;
        }
        function isEqual(value, other) {
            return baseIsEqual(value, other);
        }
        function isEqualWith(value, other, customizer) {
            customizer = typeof customizer == "function" ? customizer : undefined;
            var result = customizer ? customizer(value, other) : undefined;
            return result === undefined ? baseIsEqual(value, other, customizer) : !!result;
        }
        function isError(value) {
            if (!isObjectLike(value)) {
                return false;
            }
            return objectToString.call(value) == errorTag || typeof value.message == "string" && typeof value.name == "string";
        }
        function isFinite(value) {
            return typeof value == "number" && nativeIsFinite(value);
        }
        function isFunction(value) {
            var tag = isObject(value) ? objectToString.call(value) : "";
            return tag == funcTag || tag == genTag;
        }
        function isInteger(value) {
            return typeof value == "number" && value == toInteger(value);
        }
        function isLength(value) {
            return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }
        function isObject(value) {
            var type = typeof value;
            return value != null && (type == "object" || type == "function");
        }
        function isObjectLike(value) {
            return value != null && typeof value == "object";
        }
        var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
        function isMatch(object, source) {
            return object === source || baseIsMatch(object, source, getMatchData(source));
        }
        function isMatchWith(object, source, customizer) {
            customizer = typeof customizer == "function" ? customizer : undefined;
            return baseIsMatch(object, source, getMatchData(source), customizer);
        }
        function isNaN(value) {
            return isNumber(value) && value != +value;
        }
        function isNative(value) {
            if (isMaskable(value)) {
                throw new Error("This method is not supported with core-js. Try https://github.com/es-shims.");
            }
            return baseIsNative(value);
        }
        function isNull(value) {
            return value === null;
        }
        function isNil(value) {
            return value == null;
        }
        function isNumber(value) {
            return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
        }
        function isPlainObject(value) {
            if (!isObjectLike(value) || objectToString.call(value) != objectTag) {
                return false;
            }
            var proto = getPrototype(value);
            if (proto === null) {
                return true;
            }
            var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
            return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
        }
        var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
        function isSafeInteger(value) {
            return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
        }
        var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
        function isString(value) {
            return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
        }
        function isSymbol(value) {
            return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
        }
        var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
        function isUndefined(value) {
            return value === undefined;
        }
        function isWeakMap(value) {
            return isObjectLike(value) && getTag(value) == weakMapTag;
        }
        function isWeakSet(value) {
            return isObjectLike(value) && objectToString.call(value) == weakSetTag;
        }
        var lt = createRelationalOperation(baseLt);
        var lte = createRelationalOperation(function(value, other) {
            return value <= other;
        });
        function toArray(value) {
            if (!value) {
                return [];
            }
            if (isArrayLike(value)) {
                return isString(value) ? stringToArray(value) : copyArray(value);
            }
            if (iteratorSymbol && value[iteratorSymbol]) {
                return iteratorToArray(value[iteratorSymbol]());
            }
            var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
            return func(value);
        }
        function toFinite(value) {
            if (!value) {
                return value === 0 ? value : 0;
            }
            value = toNumber(value);
            if (value === INFINITY || value === -INFINITY) {
                var sign = value < 0 ? -1 : 1;
                return sign * MAX_INTEGER;
            }
            return value === value ? value : 0;
        }
        function toInteger(value) {
            var result = toFinite(value), remainder = result % 1;
            return result === result ? remainder ? result - remainder : result : 0;
        }
        function toLength(value) {
            return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
        }
        function toNumber(value) {
            if (typeof value == "number") {
                return value;
            }
            if (isSymbol(value)) {
                return NAN;
            }
            if (isObject(value)) {
                var other = typeof value.valueOf == "function" ? value.valueOf() : value;
                value = isObject(other) ? other + "" : other;
            }
            if (typeof value != "string") {
                return value === 0 ? value : +value;
            }
            value = value.replace(reTrim, "");
            var isBinary = reIsBinary.test(value);
            return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
        }
        function toPlainObject(value) {
            return copyObject(value, keysIn(value));
        }
        function toSafeInteger(value) {
            return baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
        }
        function toString(value) {
            return value == null ? "" : baseToString(value);
        }
        var assign = createAssigner(function(object, source) {
            if (isPrototype(source) || isArrayLike(source)) {
                copyObject(source, keys(source), object);
                return;
            }
            for (var key in source) {
                if (hasOwnProperty.call(source, key)) {
                    assignValue(object, key, source[key]);
                }
            }
        });
        var assignIn = createAssigner(function(object, source) {
            copyObject(source, keysIn(source), object);
        });
        var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
            copyObject(source, keysIn(source), object, customizer);
        });
        var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
            copyObject(source, keys(source), object, customizer);
        });
        var at = flatRest(baseAt);
        function create(prototype, properties) {
            var result = baseCreate(prototype);
            return properties ? baseAssign(result, properties) : result;
        }
        var defaults = baseRest(function(args) {
            args.push(undefined, assignInDefaults);
            return apply(assignInWith, undefined, args);
        });
        var defaultsDeep = baseRest(function(args) {
            args.push(undefined, mergeDefaults);
            return apply(mergeWith, undefined, args);
        });
        function findKey(object, predicate) {
            return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
        }
        function findLastKey(object, predicate) {
            return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
        }
        function forIn(object, iteratee) {
            return object == null ? object : baseFor(object, getIteratee(iteratee, 3), keysIn);
        }
        function forInRight(object, iteratee) {
            return object == null ? object : baseForRight(object, getIteratee(iteratee, 3), keysIn);
        }
        function forOwn(object, iteratee) {
            return object && baseForOwn(object, getIteratee(iteratee, 3));
        }
        function forOwnRight(object, iteratee) {
            return object && baseForOwnRight(object, getIteratee(iteratee, 3));
        }
        function functions(object) {
            return object == null ? [] : baseFunctions(object, keys(object));
        }
        function functionsIn(object) {
            return object == null ? [] : baseFunctions(object, keysIn(object));
        }
        function get(object, path, defaultValue) {
            var result = object == null ? undefined : baseGet(object, path);
            return result === undefined ? defaultValue : result;
        }
        function has(object, path) {
            return object != null && hasPath(object, path, baseHas);
        }
        function hasIn(object, path) {
            return object != null && hasPath(object, path, baseHasIn);
        }
        var invert = createInverter(function(result, value, key) {
            result[value] = key;
        }, constant(identity));
        var invertBy = createInverter(function(result, value, key) {
            if (hasOwnProperty.call(result, value)) {
                result[value].push(key);
            } else {
                result[value] = [ key ];
            }
        }, getIteratee);
        var invoke = baseRest(baseInvoke);
        function keys(object) {
            return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
        }
        function keysIn(object) {
            return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
        }
        function mapKeys(object, iteratee) {
            var result = {};
            iteratee = getIteratee(iteratee, 3);
            baseForOwn(object, function(value, key, object) {
                baseAssignValue(result, iteratee(value, key, object), value);
            });
            return result;
        }
        function mapValues(object, iteratee) {
            var result = {};
            iteratee = getIteratee(iteratee, 3);
            baseForOwn(object, function(value, key, object) {
                baseAssignValue(result, key, iteratee(value, key, object));
            });
            return result;
        }
        var merge = createAssigner(function(object, source, srcIndex) {
            baseMerge(object, source, srcIndex);
        });
        var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
            baseMerge(object, source, srcIndex, customizer);
        });
        var omit = flatRest(function(object, props) {
            if (object == null) {
                return {};
            }
            props = arrayMap(props, toKey);
            return basePick(object, baseDifference(getAllKeysIn(object), props));
        });
        function omitBy(object, predicate) {
            return pickBy(object, negate(getIteratee(predicate)));
        }
        var pick = flatRest(function(object, props) {
            return object == null ? {} : basePick(object, arrayMap(props, toKey));
        });
        function pickBy(object, predicate) {
            return object == null ? {} : basePickBy(object, getAllKeysIn(object), getIteratee(predicate));
        }
        function result(object, path, defaultValue) {
            path = isKey(path, object) ? [ path ] : castPath(path);
            var index = -1, length = path.length;
            if (!length) {
                object = undefined;
                length = 1;
            }
            while (++index < length) {
                var value = object == null ? undefined : object[toKey(path[index])];
                if (value === undefined) {
                    index = length;
                    value = defaultValue;
                }
                object = isFunction(value) ? value.call(object) : value;
            }
            return object;
        }
        function set(object, path, value) {
            return object == null ? object : baseSet(object, path, value);
        }
        function setWith(object, path, value, customizer) {
            customizer = typeof customizer == "function" ? customizer : undefined;
            return object == null ? object : baseSet(object, path, value, customizer);
        }
        var toPairs = createToPairs(keys);
        var toPairsIn = createToPairs(keysIn);
        function transform(object, iteratee, accumulator) {
            var isArr = isArray(object) || isTypedArray(object);
            iteratee = getIteratee(iteratee, 4);
            if (accumulator == null) {
                if (isArr || isObject(object)) {
                    var Ctor = object.constructor;
                    if (isArr) {
                        accumulator = isArray(object) ? new Ctor() : [];
                    } else {
                        accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
                    }
                } else {
                    accumulator = {};
                }
            }
            (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
                return iteratee(accumulator, value, index, object);
            });
            return accumulator;
        }
        function unset(object, path) {
            return object == null ? true : baseUnset(object, path);
        }
        function update(object, path, updater) {
            return object == null ? object : baseUpdate(object, path, castFunction(updater));
        }
        function updateWith(object, path, updater, customizer) {
            customizer = typeof customizer == "function" ? customizer : undefined;
            return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
        }
        function values(object) {
            return object ? baseValues(object, keys(object)) : [];
        }
        function valuesIn(object) {
            return object == null ? [] : baseValues(object, keysIn(object));
        }
        function clamp(number, lower, upper) {
            if (upper === undefined) {
                upper = lower;
                lower = undefined;
            }
            if (upper !== undefined) {
                upper = toNumber(upper);
                upper = upper === upper ? upper : 0;
            }
            if (lower !== undefined) {
                lower = toNumber(lower);
                lower = lower === lower ? lower : 0;
            }
            return baseClamp(toNumber(number), lower, upper);
        }
        function inRange(number, start, end) {
            start = toFinite(start);
            if (end === undefined) {
                end = start;
                start = 0;
            } else {
                end = toFinite(end);
            }
            number = toNumber(number);
            return baseInRange(number, start, end);
        }
        function random(lower, upper, floating) {
            if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
                upper = floating = undefined;
            }
            if (floating === undefined) {
                if (typeof upper == "boolean") {
                    floating = upper;
                    upper = undefined;
                } else if (typeof lower == "boolean") {
                    floating = lower;
                    lower = undefined;
                }
            }
            if (lower === undefined && upper === undefined) {
                lower = 0;
                upper = 1;
            } else {
                lower = toFinite(lower);
                if (upper === undefined) {
                    upper = lower;
                    lower = 0;
                } else {
                    upper = toFinite(upper);
                }
            }
            if (lower > upper) {
                var temp = lower;
                lower = upper;
                upper = temp;
            }
            if (floating || lower % 1 || upper % 1) {
                var rand = nativeRandom();
                return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
            }
            return baseRandom(lower, upper);
        }
        var camelCase = createCompounder(function(result, word, index) {
            word = word.toLowerCase();
            return result + (index ? capitalize(word) : word);
        });
        function capitalize(string) {
            return upperFirst(toString(string).toLowerCase());
        }
        function deburr(string) {
            string = toString(string);
            return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
        }
        function endsWith(string, target, position) {
            string = toString(string);
            target = baseToString(target);
            var length = string.length;
            position = position === undefined ? length : baseClamp(toInteger(position), 0, length);
            var end = position;
            position -= target.length;
            return position >= 0 && string.slice(position, end) == target;
        }
        function escape(string) {
            string = toString(string);
            return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
        }
        function escapeRegExp(string) {
            string = toString(string);
            return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
        }
        var kebabCase = createCompounder(function(result, word, index) {
            return result + (index ? "-" : "") + word.toLowerCase();
        });
        var lowerCase = createCompounder(function(result, word, index) {
            return result + (index ? " " : "") + word.toLowerCase();
        });
        var lowerFirst = createCaseFirst("toLowerCase");
        function pad(string, length, chars) {
            string = toString(string);
            length = toInteger(length);
            var strLength = length ? stringSize(string) : 0;
            if (!length || strLength >= length) {
                return string;
            }
            var mid = (length - strLength) / 2;
            return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
        }
        function padEnd(string, length, chars) {
            string = toString(string);
            length = toInteger(length);
            var strLength = length ? stringSize(string) : 0;
            return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
        }
        function padStart(string, length, chars) {
            string = toString(string);
            length = toInteger(length);
            var strLength = length ? stringSize(string) : 0;
            return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
        }
        function parseInt(string, radix, guard) {
            if (guard || radix == null) {
                radix = 0;
            } else if (radix) {
                radix = +radix;
            }
            return nativeParseInt(toString(string), radix || 0);
        }
        function repeat(string, n, guard) {
            if (guard ? isIterateeCall(string, n, guard) : n === undefined) {
                n = 1;
            } else {
                n = toInteger(n);
            }
            return baseRepeat(toString(string), n);
        }
        function replace() {
            var args = arguments, string = toString(args[0]);
            return args.length < 3 ? string : string.replace(args[1], args[2]);
        }
        var snakeCase = createCompounder(function(result, word, index) {
            return result + (index ? "_" : "") + word.toLowerCase();
        });
        function split(string, separator, limit) {
            if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
                separator = limit = undefined;
            }
            limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
            if (!limit) {
                return [];
            }
            string = toString(string);
            if (string && (typeof separator == "string" || separator != null && !isRegExp(separator))) {
                separator = baseToString(separator);
                if (!separator && hasUnicode(string)) {
                    return castSlice(stringToArray(string), 0, limit);
                }
            }
            return string.split(separator, limit);
        }
        var startCase = createCompounder(function(result, word, index) {
            return result + (index ? " " : "") + upperFirst(word);
        });
        function startsWith(string, target, position) {
            string = toString(string);
            position = baseClamp(toInteger(position), 0, string.length);
            target = baseToString(target);
            return string.slice(position, position + target.length) == target;
        }
        function template(string, options, guard) {
            var settings = lodash.templateSettings;
            if (guard && isIterateeCall(string, options, guard)) {
                options = undefined;
            }
            string = toString(string);
            options = assignInWith({}, options, settings, assignInDefaults);
            var imports = assignInWith({}, options.imports, settings.imports, assignInDefaults), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
            var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
            var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
            var sourceURL = "//# sourceURL=" + ("sourceURL" in options ? options.sourceURL : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
            string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
                interpolateValue || (interpolateValue = esTemplateValue);
                source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
                if (escapeValue) {
                    isEscaping = true;
                    source += "' +\n__e(" + escapeValue + ") +\n'";
                }
                if (evaluateValue) {
                    isEvaluating = true;
                    source += "';\n" + evaluateValue + ";\n__p += '";
                }
                if (interpolateValue) {
                    source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
                }
                index = offset + match.length;
                return match;
            });
            source += "';\n";
            var variable = options.variable;
            if (!variable) {
                source = "with (obj) {\n" + source + "\n}\n";
            }
            source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
            source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
            var result = attempt(function() {
                return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);
            });
            result.source = source;
            if (isError(result)) {
                throw result;
            }
            return result;
        }
        function toLower(value) {
            return toString(value).toLowerCase();
        }
        function toUpper(value) {
            return toString(value).toUpperCase();
        }
        function trim(string, chars, guard) {
            string = toString(string);
            if (string && (guard || chars === undefined)) {
                return string.replace(reTrim, "");
            }
            if (!string || !(chars = baseToString(chars))) {
                return string;
            }
            var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
            return castSlice(strSymbols, start, end).join("");
        }
        function trimEnd(string, chars, guard) {
            string = toString(string);
            if (string && (guard || chars === undefined)) {
                return string.replace(reTrimEnd, "");
            }
            if (!string || !(chars = baseToString(chars))) {
                return string;
            }
            var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
            return castSlice(strSymbols, 0, end).join("");
        }
        function trimStart(string, chars, guard) {
            string = toString(string);
            if (string && (guard || chars === undefined)) {
                return string.replace(reTrimStart, "");
            }
            if (!string || !(chars = baseToString(chars))) {
                return string;
            }
            var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
            return castSlice(strSymbols, start).join("");
        }
        function truncate(string, options) {
            var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
            if (isObject(options)) {
                var separator = "separator" in options ? options.separator : separator;
                length = "length" in options ? toInteger(options.length) : length;
                omission = "omission" in options ? baseToString(options.omission) : omission;
            }
            string = toString(string);
            var strLength = string.length;
            if (hasUnicode(string)) {
                var strSymbols = stringToArray(string);
                strLength = strSymbols.length;
            }
            if (length >= strLength) {
                return string;
            }
            var end = length - stringSize(omission);
            if (end < 1) {
                return omission;
            }
            var result = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
            if (separator === undefined) {
                return result + omission;
            }
            if (strSymbols) {
                end += result.length - end;
            }
            if (isRegExp(separator)) {
                if (string.slice(end).search(separator)) {
                    var match, substring = result;
                    if (!separator.global) {
                        separator = RegExp(separator.source, toString(reFlags.exec(separator)) + "g");
                    }
                    separator.lastIndex = 0;
                    while (match = separator.exec(substring)) {
                        var newEnd = match.index;
                    }
                    result = result.slice(0, newEnd === undefined ? end : newEnd);
                }
            } else if (string.indexOf(baseToString(separator), end) != end) {
                var index = result.lastIndexOf(separator);
                if (index > -1) {
                    result = result.slice(0, index);
                }
            }
            return result + omission;
        }
        function unescape(string) {
            string = toString(string);
            return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
        }
        var upperCase = createCompounder(function(result, word, index) {
            return result + (index ? " " : "") + word.toUpperCase();
        });
        var upperFirst = createCaseFirst("toUpperCase");
        function words(string, pattern, guard) {
            string = toString(string);
            pattern = guard ? undefined : pattern;
            if (pattern === undefined) {
                return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
            }
            return string.match(pattern) || [];
        }
        var attempt = baseRest(function(func, args) {
            try {
                return apply(func, undefined, args);
            } catch (e) {
                return isError(e) ? e : new Error(e);
            }
        });
        var bindAll = flatRest(function(object, methodNames) {
            arrayEach(methodNames, function(key) {
                key = toKey(key);
                baseAssignValue(object, key, bind(object[key], object));
            });
            return object;
        });
        function cond(pairs) {
            var length = pairs ? pairs.length : 0, toIteratee = getIteratee();
            pairs = !length ? [] : arrayMap(pairs, function(pair) {
                if (typeof pair[1] != "function") {
                    throw new TypeError(FUNC_ERROR_TEXT);
                }
                return [ toIteratee(pair[0]), pair[1] ];
            });
            return baseRest(function(args) {
                var index = -1;
                while (++index < length) {
                    var pair = pairs[index];
                    if (apply(pair[0], this, args)) {
                        return apply(pair[1], this, args);
                    }
                }
            });
        }
        function conforms(source) {
            return baseConforms(baseClone(source, true));
        }
        function constant(value) {
            return function() {
                return value;
            };
        }
        function defaultTo(value, defaultValue) {
            return value == null || value !== value ? defaultValue : value;
        }
        var flow = createFlow();
        var flowRight = createFlow(true);
        function identity(value) {
            return value;
        }
        function iteratee(func) {
            return baseIteratee(typeof func == "function" ? func : baseClone(func, true));
        }
        function matches(source) {
            return baseMatches(baseClone(source, true));
        }
        function matchesProperty(path, srcValue) {
            return baseMatchesProperty(path, baseClone(srcValue, true));
        }
        var method = baseRest(function(path, args) {
            return function(object) {
                return baseInvoke(object, path, args);
            };
        });
        var methodOf = baseRest(function(object, args) {
            return function(path) {
                return baseInvoke(object, path, args);
            };
        });
        function mixin(object, source, options) {
            var props = keys(source), methodNames = baseFunctions(source, props);
            if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
                options = source;
                source = object;
                object = this;
                methodNames = baseFunctions(source, keys(source));
            }
            var chain = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
            arrayEach(methodNames, function(methodName) {
                var func = source[methodName];
                object[methodName] = func;
                if (isFunc) {
                    object.prototype[methodName] = function() {
                        var chainAll = this.__chain__;
                        if (chain || chainAll) {
                            var result = object(this.__wrapped__), actions = result.__actions__ = copyArray(this.__actions__);
                            actions.push({
                                func: func,
                                args: arguments,
                                thisArg: object
                            });
                            result.__chain__ = chainAll;
                            return result;
                        }
                        return func.apply(object, arrayPush([ this.value() ], arguments));
                    };
                }
            });
            return object;
        }
        function noConflict() {
            if (root._ === this) {
                root._ = oldDash;
            }
            return this;
        }
        function noop() {}
        function nthArg(n) {
            n = toInteger(n);
            return baseRest(function(args) {
                return baseNth(args, n);
            });
        }
        var over = createOver(arrayMap);
        var overEvery = createOver(arrayEvery);
        var overSome = createOver(arraySome);
        function property(path) {
            return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
        }
        function propertyOf(object) {
            return function(path) {
                return object == null ? undefined : baseGet(object, path);
            };
        }
        var range = createRange();
        var rangeRight = createRange(true);
        function stubArray() {
            return [];
        }
        function stubFalse() {
            return false;
        }
        function stubObject() {
            return {};
        }
        function stubString() {
            return "";
        }
        function stubTrue() {
            return true;
        }
        function times(n, iteratee) {
            n = toInteger(n);
            if (n < 1 || n > MAX_SAFE_INTEGER) {
                return [];
            }
            var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
            iteratee = getIteratee(iteratee);
            n -= MAX_ARRAY_LENGTH;
            var result = baseTimes(length, iteratee);
            while (++index < n) {
                iteratee(index);
            }
            return result;
        }
        function toPath(value) {
            if (isArray(value)) {
                return arrayMap(value, toKey);
            }
            return isSymbol(value) ? [ value ] : copyArray(stringToPath(value));
        }
        function uniqueId(prefix) {
            var id = ++idCounter;
            return toString(prefix) + id;
        }
        var add = createMathOperation(function(augend, addend) {
            return augend + addend;
        }, 0);
        var ceil = createRound("ceil");
        var divide = createMathOperation(function(dividend, divisor) {
            return dividend / divisor;
        }, 1);
        var floor = createRound("floor");
        function max(array) {
            return array && array.length ? baseExtremum(array, identity, baseGt) : undefined;
        }
        function maxBy(array, iteratee) {
            return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseGt) : undefined;
        }
        function mean(array) {
            return baseMean(array, identity);
        }
        function meanBy(array, iteratee) {
            return baseMean(array, getIteratee(iteratee, 2));
        }
        function min(array) {
            return array && array.length ? baseExtremum(array, identity, baseLt) : undefined;
        }
        function minBy(array, iteratee) {
            return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseLt) : undefined;
        }
        var multiply = createMathOperation(function(multiplier, multiplicand) {
            return multiplier * multiplicand;
        }, 1);
        var round = createRound("round");
        var subtract = createMathOperation(function(minuend, subtrahend) {
            return minuend - subtrahend;
        }, 0);
        function sum(array) {
            return array && array.length ? baseSum(array, identity) : 0;
        }
        function sumBy(array, iteratee) {
            return array && array.length ? baseSum(array, getIteratee(iteratee, 2)) : 0;
        }
        lodash.after = after;
        lodash.ary = ary;
        lodash.assign = assign;
        lodash.assignIn = assignIn;
        lodash.assignInWith = assignInWith;
        lodash.assignWith = assignWith;
        lodash.at = at;
        lodash.before = before;
        lodash.bind = bind;
        lodash.bindAll = bindAll;
        lodash.bindKey = bindKey;
        lodash.castArray = castArray;
        lodash.chain = chain;
        lodash.chunk = chunk;
        lodash.compact = compact;
        lodash.concat = concat;
        lodash.cond = cond;
        lodash.conforms = conforms;
        lodash.constant = constant;
        lodash.countBy = countBy;
        lodash.create = create;
        lodash.curry = curry;
        lodash.curryRight = curryRight;
        lodash.debounce = debounce;
        lodash.defaults = defaults;
        lodash.defaultsDeep = defaultsDeep;
        lodash.defer = defer;
        lodash.delay = delay;
        lodash.difference = difference;
        lodash.differenceBy = differenceBy;
        lodash.differenceWith = differenceWith;
        lodash.drop = drop;
        lodash.dropRight = dropRight;
        lodash.dropRightWhile = dropRightWhile;
        lodash.dropWhile = dropWhile;
        lodash.fill = fill;
        lodash.filter = filter;
        lodash.flatMap = flatMap;
        lodash.flatMapDeep = flatMapDeep;
        lodash.flatMapDepth = flatMapDepth;
        lodash.flatten = flatten;
        lodash.flattenDeep = flattenDeep;
        lodash.flattenDepth = flattenDepth;
        lodash.flip = flip;
        lodash.flow = flow;
        lodash.flowRight = flowRight;
        lodash.fromPairs = fromPairs;
        lodash.functions = functions;
        lodash.functionsIn = functionsIn;
        lodash.groupBy = groupBy;
        lodash.initial = initial;
        lodash.intersection = intersection;
        lodash.intersectionBy = intersectionBy;
        lodash.intersectionWith = intersectionWith;
        lodash.invert = invert;
        lodash.invertBy = invertBy;
        lodash.invokeMap = invokeMap;
        lodash.iteratee = iteratee;
        lodash.keyBy = keyBy;
        lodash.keys = keys;
        lodash.keysIn = keysIn;
        lodash.map = map;
        lodash.mapKeys = mapKeys;
        lodash.mapValues = mapValues;
        lodash.matches = matches;
        lodash.matchesProperty = matchesProperty;
        lodash.memoize = memoize;
        lodash.merge = merge;
        lodash.mergeWith = mergeWith;
        lodash.method = method;
        lodash.methodOf = methodOf;
        lodash.mixin = mixin;
        lodash.negate = negate;
        lodash.nthArg = nthArg;
        lodash.omit = omit;
        lodash.omitBy = omitBy;
        lodash.once = once;
        lodash.orderBy = orderBy;
        lodash.over = over;
        lodash.overArgs = overArgs;
        lodash.overEvery = overEvery;
        lodash.overSome = overSome;
        lodash.partial = partial;
        lodash.partialRight = partialRight;
        lodash.partition = partition;
        lodash.pick = pick;
        lodash.pickBy = pickBy;
        lodash.property = property;
        lodash.propertyOf = propertyOf;
        lodash.pull = pull;
        lodash.pullAll = pullAll;
        lodash.pullAllBy = pullAllBy;
        lodash.pullAllWith = pullAllWith;
        lodash.pullAt = pullAt;
        lodash.range = range;
        lodash.rangeRight = rangeRight;
        lodash.rearg = rearg;
        lodash.reject = reject;
        lodash.remove = remove;
        lodash.rest = rest;
        lodash.reverse = reverse;
        lodash.sampleSize = sampleSize;
        lodash.set = set;
        lodash.setWith = setWith;
        lodash.shuffle = shuffle;
        lodash.slice = slice;
        lodash.sortBy = sortBy;
        lodash.sortedUniq = sortedUniq;
        lodash.sortedUniqBy = sortedUniqBy;
        lodash.split = split;
        lodash.spread = spread;
        lodash.tail = tail;
        lodash.take = take;
        lodash.takeRight = takeRight;
        lodash.takeRightWhile = takeRightWhile;
        lodash.takeWhile = takeWhile;
        lodash.tap = tap;
        lodash.throttle = throttle;
        lodash.thru = thru;
        lodash.toArray = toArray;
        lodash.toPairs = toPairs;
        lodash.toPairsIn = toPairsIn;
        lodash.toPath = toPath;
        lodash.toPlainObject = toPlainObject;
        lodash.transform = transform;
        lodash.unary = unary;
        lodash.union = union;
        lodash.unionBy = unionBy;
        lodash.unionWith = unionWith;
        lodash.uniq = uniq;
        lodash.uniqBy = uniqBy;
        lodash.uniqWith = uniqWith;
        lodash.unset = unset;
        lodash.unzip = unzip;
        lodash.unzipWith = unzipWith;
        lodash.update = update;
        lodash.updateWith = updateWith;
        lodash.values = values;
        lodash.valuesIn = valuesIn;
        lodash.without = without;
        lodash.words = words;
        lodash.wrap = wrap;
        lodash.xor = xor;
        lodash.xorBy = xorBy;
        lodash.xorWith = xorWith;
        lodash.zip = zip;
        lodash.zipObject = zipObject;
        lodash.zipObjectDeep = zipObjectDeep;
        lodash.zipWith = zipWith;
        lodash.entries = toPairs;
        lodash.entriesIn = toPairsIn;
        lodash.extend = assignIn;
        lodash.extendWith = assignInWith;
        mixin(lodash, lodash);
        lodash.add = add;
        lodash.attempt = attempt;
        lodash.camelCase = camelCase;
        lodash.capitalize = capitalize;
        lodash.ceil = ceil;
        lodash.clamp = clamp;
        lodash.clone = clone;
        lodash.cloneDeep = cloneDeep;
        lodash.cloneDeepWith = cloneDeepWith;
        lodash.cloneWith = cloneWith;
        lodash.conformsTo = conformsTo;
        lodash.deburr = deburr;
        lodash.defaultTo = defaultTo;
        lodash.divide = divide;
        lodash.endsWith = endsWith;
        lodash.eq = eq;
        lodash.escape = escape;
        lodash.escapeRegExp = escapeRegExp;
        lodash.every = every;
        lodash.find = find;
        lodash.findIndex = findIndex;
        lodash.findKey = findKey;
        lodash.findLast = findLast;
        lodash.findLastIndex = findLastIndex;
        lodash.findLastKey = findLastKey;
        lodash.floor = floor;
        lodash.forEach = forEach;
        lodash.forEachRight = forEachRight;
        lodash.forIn = forIn;
        lodash.forInRight = forInRight;
        lodash.forOwn = forOwn;
        lodash.forOwnRight = forOwnRight;
        lodash.get = get;
        lodash.gt = gt;
        lodash.gte = gte;
        lodash.has = has;
        lodash.hasIn = hasIn;
        lodash.head = head;
        lodash.identity = identity;
        lodash.includes = includes;
        lodash.indexOf = indexOf;
        lodash.inRange = inRange;
        lodash.invoke = invoke;
        lodash.isArguments = isArguments;
        lodash.isArray = isArray;
        lodash.isArrayBuffer = isArrayBuffer;
        lodash.isArrayLike = isArrayLike;
        lodash.isArrayLikeObject = isArrayLikeObject;
        lodash.isBoolean = isBoolean;
        lodash.isBuffer = isBuffer;
        lodash.isDate = isDate;
        lodash.isElement = isElement;
        lodash.isEmpty = isEmpty;
        lodash.isEqual = isEqual;
        lodash.isEqualWith = isEqualWith;
        lodash.isError = isError;
        lodash.isFinite = isFinite;
        lodash.isFunction = isFunction;
        lodash.isInteger = isInteger;
        lodash.isLength = isLength;
        lodash.isMap = isMap;
        lodash.isMatch = isMatch;
        lodash.isMatchWith = isMatchWith;
        lodash.isNaN = isNaN;
        lodash.isNative = isNative;
        lodash.isNil = isNil;
        lodash.isNull = isNull;
        lodash.isNumber = isNumber;
        lodash.isObject = isObject;
        lodash.isObjectLike = isObjectLike;
        lodash.isPlainObject = isPlainObject;
        lodash.isRegExp = isRegExp;
        lodash.isSafeInteger = isSafeInteger;
        lodash.isSet = isSet;
        lodash.isString = isString;
        lodash.isSymbol = isSymbol;
        lodash.isTypedArray = isTypedArray;
        lodash.isUndefined = isUndefined;
        lodash.isWeakMap = isWeakMap;
        lodash.isWeakSet = isWeakSet;
        lodash.join = join;
        lodash.kebabCase = kebabCase;
        lodash.last = last;
        lodash.lastIndexOf = lastIndexOf;
        lodash.lowerCase = lowerCase;
        lodash.lowerFirst = lowerFirst;
        lodash.lt = lt;
        lodash.lte = lte;
        lodash.max = max;
        lodash.maxBy = maxBy;
        lodash.mean = mean;
        lodash.meanBy = meanBy;
        lodash.min = min;
        lodash.minBy = minBy;
        lodash.stubArray = stubArray;
        lodash.stubFalse = stubFalse;
        lodash.stubObject = stubObject;
        lodash.stubString = stubString;
        lodash.stubTrue = stubTrue;
        lodash.multiply = multiply;
        lodash.nth = nth;
        lodash.noConflict = noConflict;
        lodash.noop = noop;
        lodash.now = now;
        lodash.pad = pad;
        lodash.padEnd = padEnd;
        lodash.padStart = padStart;
        lodash.parseInt = parseInt;
        lodash.random = random;
        lodash.reduce = reduce;
        lodash.reduceRight = reduceRight;
        lodash.repeat = repeat;
        lodash.replace = replace;
        lodash.result = result;
        lodash.round = round;
        lodash.runInContext = runInContext;
        lodash.sample = sample;
        lodash.size = size;
        lodash.snakeCase = snakeCase;
        lodash.some = some;
        lodash.sortedIndex = sortedIndex;
        lodash.sortedIndexBy = sortedIndexBy;
        lodash.sortedIndexOf = sortedIndexOf;
        lodash.sortedLastIndex = sortedLastIndex;
        lodash.sortedLastIndexBy = sortedLastIndexBy;
        lodash.sortedLastIndexOf = sortedLastIndexOf;
        lodash.startCase = startCase;
        lodash.startsWith = startsWith;
        lodash.subtract = subtract;
        lodash.sum = sum;
        lodash.sumBy = sumBy;
        lodash.template = template;
        lodash.times = times;
        lodash.toFinite = toFinite;
        lodash.toInteger = toInteger;
        lodash.toLength = toLength;
        lodash.toLower = toLower;
        lodash.toNumber = toNumber;
        lodash.toSafeInteger = toSafeInteger;
        lodash.toString = toString;
        lodash.toUpper = toUpper;
        lodash.trim = trim;
        lodash.trimEnd = trimEnd;
        lodash.trimStart = trimStart;
        lodash.truncate = truncate;
        lodash.unescape = unescape;
        lodash.uniqueId = uniqueId;
        lodash.upperCase = upperCase;
        lodash.upperFirst = upperFirst;
        lodash.each = forEach;
        lodash.eachRight = forEachRight;
        lodash.first = head;
        mixin(lodash, function() {
            var source = {};
            baseForOwn(lodash, function(func, methodName) {
                if (!hasOwnProperty.call(lodash.prototype, methodName)) {
                    source[methodName] = func;
                }
            });
            return source;
        }(), {
            chain: false
        });
        lodash.VERSION = VERSION;
        arrayEach([ "bind", "bindKey", "curry", "curryRight", "partial", "partialRight" ], function(methodName) {
            lodash[methodName].placeholder = lodash;
        });
        arrayEach([ "drop", "take" ], function(methodName, index) {
            LazyWrapper.prototype[methodName] = function(n) {
                var filtered = this.__filtered__;
                if (filtered && !index) {
                    return new LazyWrapper(this);
                }
                n = n === undefined ? 1 : nativeMax(toInteger(n), 0);
                var result = this.clone();
                if (filtered) {
                    result.__takeCount__ = nativeMin(n, result.__takeCount__);
                } else {
                    result.__views__.push({
                        size: nativeMin(n, MAX_ARRAY_LENGTH),
                        type: methodName + (result.__dir__ < 0 ? "Right" : "")
                    });
                }
                return result;
            };
            LazyWrapper.prototype[methodName + "Right"] = function(n) {
                return this.reverse()[methodName](n).reverse();
            };
        });
        arrayEach([ "filter", "map", "takeWhile" ], function(methodName, index) {
            var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
            LazyWrapper.prototype[methodName] = function(iteratee) {
                var result = this.clone();
                result.__iteratees__.push({
                    iteratee: getIteratee(iteratee, 3),
                    type: type
                });
                result.__filtered__ = result.__filtered__ || isFilter;
                return result;
            };
        });
        arrayEach([ "head", "last" ], function(methodName, index) {
            var takeName = "take" + (index ? "Right" : "");
            LazyWrapper.prototype[methodName] = function() {
                return this[takeName](1).value()[0];
            };
        });
        arrayEach([ "initial", "tail" ], function(methodName, index) {
            var dropName = "drop" + (index ? "" : "Right");
            LazyWrapper.prototype[methodName] = function() {
                return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
            };
        });
        LazyWrapper.prototype.compact = function() {
            return this.filter(identity);
        };
        LazyWrapper.prototype.find = function(predicate) {
            return this.filter(predicate).head();
        };
        LazyWrapper.prototype.findLast = function(predicate) {
            return this.reverse().find(predicate);
        };
        LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
            if (typeof path == "function") {
                return new LazyWrapper(this);
            }
            return this.map(function(value) {
                return baseInvoke(value, path, args);
            });
        });
        LazyWrapper.prototype.reject = function(predicate) {
            return this.filter(negate(getIteratee(predicate)));
        };
        LazyWrapper.prototype.slice = function(start, end) {
            start = toInteger(start);
            var result = this;
            if (result.__filtered__ && (start > 0 || end < 0)) {
                return new LazyWrapper(result);
            }
            if (start < 0) {
                result = result.takeRight(-start);
            } else if (start) {
                result = result.drop(start);
            }
            if (end !== undefined) {
                end = toInteger(end);
                result = end < 0 ? result.dropRight(-end) : result.take(end - start);
            }
            return result;
        };
        LazyWrapper.prototype.takeRightWhile = function(predicate) {
            return this.reverse().takeWhile(predicate).reverse();
        };
        LazyWrapper.prototype.toArray = function() {
            return this.take(MAX_ARRAY_LENGTH);
        };
        baseForOwn(LazyWrapper.prototype, function(func, methodName) {
            var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
            if (!lodashFunc) {
                return;
            }
            lodash.prototype[methodName] = function() {
                var value = this.__wrapped__, args = isTaker ? [ 1 ] : arguments, isLazy = value instanceof LazyWrapper, iteratee = args[0], useLazy = isLazy || isArray(value);
                var interceptor = function(value) {
                    var result = lodashFunc.apply(lodash, arrayPush([ value ], args));
                    return isTaker && chainAll ? result[0] : result;
                };
                if (useLazy && checkIteratee && typeof iteratee == "function" && iteratee.length != 1) {
                    isLazy = useLazy = false;
                }
                var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
                if (!retUnwrapped && useLazy) {
                    value = onlyLazy ? value : new LazyWrapper(this);
                    var result = func.apply(value, args);
                    result.__actions__.push({
                        func: thru,
                        args: [ interceptor ],
                        thisArg: undefined
                    });
                    return new LodashWrapper(result, chainAll);
                }
                if (isUnwrapped && onlyLazy) {
                    return func.apply(this, args);
                }
                result = this.thru(interceptor);
                return isUnwrapped ? isTaker ? result.value()[0] : result.value() : result;
            };
        });
        arrayEach([ "pop", "push", "shift", "sort", "splice", "unshift" ], function(methodName) {
            var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
            lodash.prototype[methodName] = function() {
                var args = arguments;
                if (retUnwrapped && !this.__chain__) {
                    var value = this.value();
                    return func.apply(isArray(value) ? value : [], args);
                }
                return this[chainName](function(value) {
                    return func.apply(isArray(value) ? value : [], args);
                });
            };
        });
        baseForOwn(LazyWrapper.prototype, function(func, methodName) {
            var lodashFunc = lodash[methodName];
            if (lodashFunc) {
                var key = lodashFunc.name + "", names = realNames[key] || (realNames[key] = []);
                names.push({
                    name: methodName,
                    func: lodashFunc
                });
            }
        });
        realNames[createHybrid(undefined, BIND_KEY_FLAG).name] = [ {
            name: "wrapper",
            func: undefined
        } ];
        LazyWrapper.prototype.clone = lazyClone;
        LazyWrapper.prototype.reverse = lazyReverse;
        LazyWrapper.prototype.value = lazyValue;
        lodash.prototype.at = wrapperAt;
        lodash.prototype.chain = wrapperChain;
        lodash.prototype.commit = wrapperCommit;
        lodash.prototype.next = wrapperNext;
        lodash.prototype.plant = wrapperPlant;
        lodash.prototype.reverse = wrapperReverse;
        lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
        lodash.prototype.first = lodash.prototype.head;
        if (iteratorSymbol) {
            lodash.prototype[iteratorSymbol] = wrapperToIterator;
        }
        return lodash;
    }
    var _ = runInContext();
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        root._ = _;
        define(function() {
            return _;
        });
    } else if (freeModule) {
        (freeModule.exports = _)._ = _;
        freeExports._ = _;
    } else {
        root._ = _;
    }
}).call(this);

var UsergridAuthMode = Object.freeze({
    NONE: "none",
    USER: "user",
    APP: "app"
});

var UsergridDirection = Object.freeze({
    IN: "connecting",
    OUT: "connections"
});

var UsergridHttpMethod = Object.freeze({
    GET: "GET",
    PUT: "PUT",
    POST: "POST",
    DELETE: "DELETE"
});

var UsergridQueryOperator = Object.freeze({
    EQUAL: "=",
    GREATER_THAN: ">",
    GREATER_THAN_EQUAL_TO: ">=",
    LESS_THAN: "<",
    LESS_THAN_EQUAL_TO: "<="
});

var UsergridQuerySortOrder = Object.freeze({
    ASC: "asc",
    DESC: "desc"
});

(function(global) {
    var name = "UsergridHelpers", overwrittenName = global[name];
    function UsergridHelpers() {}
    UsergridHelpers.validateAndRetrieveClient = function(args) {
        var client = undefined;
        if (args instanceof UsergridClient) {
            client = args;
        } else if (args[0] instanceof UsergridClient) {
            client = args[0];
        } else if (_.get(args, "client")) {
            client = args.client;
        } else if (Usergrid.isInitialized) {
            client = Usergrid;
        } else {
            throw new Error("this method requires either the Usergrid shared instance to be initialized or a UsergridClient instance as the first argument");
        }
        return client;
    };
    UsergridHelpers.inherits = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    };
    UsergridHelpers.flattenArgs = function(args) {
        return _.flattenDeep(Array.prototype.slice.call(args));
    };
    UsergridHelpers.callback = function() {
        var args = _.flattenDeep(Array.prototype.slice.call(arguments)).reverse();
        var emptyFunc = function() {};
        return _.first(_.flattenDeep([ args, _.get(args, "0.callback"), emptyFunc ]).filter(_.isFunction));
    };
    UsergridHelpers.doCallback = function(callback, params, context) {
        var returnValue;
        if (_.isFunction(callback)) {
            if (!params) params = [];
            if (!context) context = this;
            params.push(context);
            returnValue = callback.apply(context, params);
        }
        return returnValue;
    };
    UsergridHelpers.authForRequests = function(client) {
        var authForRequests = undefined;
        if (_.get(client, "tempAuth.isValid")) {
            authForRequests = client.tempAuth;
            client.tempAuth = undefined;
        } else if (_.get(client, "currentUser.auth.isValid") && client.authMode === UsergridAuthMode.USER) {
            authForRequests = client.currentUser.auth;
        } else if (_.get(client, "appAuth.isValid") && client.authMode === UsergridAuthMode.APP) {
            authForRequests = client.appAuth;
        }
        return authForRequests;
    };
    UsergridHelpers.userLoginBody = function(options) {
        var body = {
            grant_type: "password",
            password: options.password
        };
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl;
        }
        body[options.username ? "username" : "email"] = options.username ? options.username : options.email;
        return body;
    };
    UsergridHelpers.appLoginBody = function(options) {
        var body = {
            grant_type: "client_credentials",
            client_id: options.clientId,
            client_secret: options.clientSecret
        };
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl;
        }
        return body;
    };
    UsergridHelpers.calculateExpiry = function(expires_in) {
        return Date.now() + (expires_in ? expires_in - 5 : 0) * 1e3;
    };
    var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    UsergridHelpers.isUUID = function(uuid) {
        return !uuid ? false : uuidValueRegex.test(uuid);
    };
    UsergridHelpers.useQuotesIfRequired = function(value) {
        return _.isFinite(value) || UsergridHelpers.isUUID(value) || _.isBoolean(value) || _.isObject(value) && !_.isFunction(value) || _.isArray(value) ? value : "'" + value + "'";
    };
    UsergridHelpers.setReadOnly = function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                UsergridHelpers.setReadOnly(obj, k);
            });
        } else if (_.isPlainObject(obj[key])) {
            return Object.freeze(obj[key]);
        } else if (_.isPlainObject(obj) && key === undefined) {
            return Object.freeze(obj);
        } else if (_.has(obj, key)) {
            return Object.defineProperty(obj, key, {
                writable: false
            });
        } else {
            return obj;
        }
    };
    UsergridHelpers.setWritable = function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                UsergridHelpers.setWritable(obj, k);
            });
        } else if (_.isPlainObject(obj[key])) {
            return _.clone(obj[key]);
        } else if (_.isPlainObject(obj) && key === undefined) {
            return _.clone(obj);
        } else if (_.has(obj, key)) {
            return Object.defineProperty(obj, key, {
                writable: true
            });
        } else {
            return obj;
        }
    };
    UsergridHelpers.assignPrefabOptions = function(args) {
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && _.has(args, "method")) {
            _.assign(this, args[0]);
        }
        return this;
    };
    UsergridHelpers.normalize = function(str) {
        str = str.replace(/:\//g, "://");
        str = str.replace(/([^:\s])\/+/g, "$1/");
        str = str.replace(/\/(\?|&|#[^!])/g, "$1");
        str = str.replace(/(\?.+)\?/g, "$1&");
        return str;
    };
    UsergridHelpers.urljoin = function() {
        var input = arguments;
        var options = {};
        if (typeof arguments[0] === "object") {
            input = arguments[0];
            options = arguments[1] || {};
        }
        var joined = [].slice.call(input, 0).join("/");
        return UsergridHelpers.normalize(joined, options);
    };
    UsergridHelpers.parseResponseHeaders = function(headerStr) {
        var headers = {};
        if (!headerStr) {
            return headers;
        }
        var headerPairs = headerStr.split("\r\n");
        for (var i = 0; i < headerPairs.length; i++) {
            var headerPair = headerPairs[i];
            var index = headerPair.indexOf(": ");
            if (index > 0) {
                var key = headerPair.substring(0, index);
                headers[key] = headerPair.substring(index + 2);
            }
        }
        return headers;
    };
    UsergridHelpers.uri = function(client, method, options) {
        var path = "";
        if (options instanceof UsergridEntity) {
            path = options.type;
        } else if (options instanceof UsergridQuery) {
            path = options._type;
        } else if (_.isString(options)) {
            path = options;
        } else if (_.isArray(options)) {
            path = _.get(options, "0.type") || _.get(options, "0.path");
        } else {
            path = options.path || options.type || _.get(options, "entity.type") || _.get(options, "query._type") || _.get(options, "body.type") || _.get(options, "body.path");
        }
        var uuidOrName = "";
        if (method !== UsergridHttpMethod.POST) {
            uuidOrName = _.first([ options.uuidOrName, options.uuid, options.name, _.get(options, "entity.uuid"), _.get(options, "entity.name"), _.get(options, "body.uuid"), _.get(options, "body.name"), "" ].filter(_.isString));
        }
        return UsergridHelpers.urljoin(client.baseUrl, client.orgId, client.appId, path, uuidOrName);
    };
    UsergridHelpers.body = function(options) {
        var rawBody = undefined;
        if (options instanceof UsergridEntity) {
            rawBody = options;
        } else {
            rawBody = options.body || options.entity || options.entities;
            if (rawBody === undefined) {
                if (_.isArray(options)) {
                    if (options[0] instanceof UsergridEntity) {
                        rawBody = options;
                    }
                }
            }
        }
        var returnBody = rawBody;
        if (rawBody instanceof UsergridEntity) {
            returnBody = rawBody.jsonValue();
        } else if (rawBody instanceof Array) {
            if (rawBody[0] instanceof UsergridEntity) {
                returnBody = _.map(rawBody, function(entity) {
                    return entity.jsonValue();
                });
            }
        }
        return returnBody;
    };
    UsergridHelpers.updateEntityFromRemote = function(entity, usergridResponse) {
        UsergridHelpers.setWritable(entity, [ "uuid", "name", "type", "created" ]);
        _.assign(entity, usergridResponse.entity);
        UsergridHelpers.setReadOnly(entity, [ "uuid", "name", "type", "created" ]);
    };
    UsergridHelpers.headers = function(client, options) {
        var headers = {
            "User-Agent": "usergrid-js/v" + UsergridSDKVersion
        };
        _.assign(headers, options.headers);
        var authForRequests = UsergridHelpers.authForRequests(client);
        if (authForRequests) {
            _.assign(headers, {
                authorization: "Bearer " + authForRequests.token
            });
        }
        return headers;
    };
    UsergridHelpers.encode = function(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var encode = encodeURIComponent;
            _.forOwn(data, function(value, key) {
                result += "&" + encode(key) + "=" + encode(value);
            });
        }
        return result;
    };
    UsergridHelpers.buildConnectionRequest = function(client, method, args) {
        var options = {
            client: client,
            method: method,
            entity: {},
            to: {}
        };
        UsergridHelpers.assignPrefabOptions.call(options, args);
        if (_.isObject(options.from)) {
            options.to = options.from;
        }
        if (_.isObject(args[0]) && _.has(args[0], "entity") && _.has(args[0], "to")) {
            _.assign(options.entity, args[0].entity);
            options.relationship = _.get(args, "0.relationship");
            _.assign(options.to, args[0].to);
        }
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && _.isString(args[1])) {
            _.assign(options.entity, args[0]);
            options.relationship = _.first([ options.relationship, args[1] ].filter(_.isString));
        }
        if (_.isObject(args[2]) && !_.isFunction(args[2])) {
            _.assign(options.to, args[2]);
        }
        options.entity.uuidOrName = _.first([ options.entity.uuidOrName, options.entity.uuid, options.entity.name, args[1] ].filter(_.isString));
        if (!options.entity.type) {
            options.entity.type = _.first([ options.entity.type, args[0] ].filter(_.isString));
        }
        options.relationship = _.first([ options.relationship, args[2] ].filter(_.isString));
        if (_.isString(args[3]) && !UsergridHelpers.isUUID(args[3]) && _.isString(args[4])) {
            options.to.type = args[3];
        } else if (_.isString(args[2]) && !UsergridHelpers.isUUID(args[2]) && _.isString(args[3]) && _.isObject(args[0]) && !_.isFunction(args[0])) {
            options.to.type = args[2];
        }
        options.to.uuidOrName = _.first([ options.to.uuidOrName, options.to.uuid, options.to.name, args[4], args[3], args[2] ].filter(function(property) {
            return _.isString(options.to.type) && _.isString(property) || UsergridHelpers.isUUID(property);
        }));
        if (!_.isString(options.entity.uuidOrName)) {
            throw new Error('source entity "uuidOrName" is required when connecting or disconnecting entities');
        }
        if (!_.isString(options.to.uuidOrName)) {
            throw new Error('target entity "uuidOrName" is required when connecting or disconnecting entities');
        }
        if (!_.isString(options.to.type) && !UsergridHelpers.isUUID(options.to.uuidOrName)) {
            throw new Error('target "type" (collection name) parameter is required connecting or disconnecting entities by name');
        }
        options.uri = UsergridHelpers.urljoin(client.baseUrl, client.orgId, client.appId, _.isString(options.entity.type) ? options.entity.type : "", _.isString(options.entity.uuidOrName) ? options.entity.uuidOrName : "", options.relationship, _.isString(options.to.type) ? options.to.type : "", _.isString(options.to.uuidOrName) ? options.to.uuidOrName : "");
        return new UsergridRequest(options);
    };
    UsergridHelpers.buildGetConnectionRequest = function(client, args) {
        var options = {
            client: client,
            method: "GET"
        };
        UsergridHelpers.assignPrefabOptions.call(options, args);
        if (_.isObject(args[1]) && !_.isFunction(args[1])) {
            _.assign(options, args[1]);
        }
        options.direction = _.first([ options.direction, args[0] ].filter(function(property) {
            return property === UsergridDirection.IN || property === UsergridDirection.OUT;
        }));
        options.relationship = _.first([ options.relationship, args[3], args[2] ].filter(_.isString));
        options.uuidOrName = _.first([ options.uuidOrName, options.uuid, options.name, args[2] ].filter(_.isString));
        options.type = _.first([ options.type, args[1] ].filter(_.isString));
        if (!_.isString(options.type)) {
            throw new Error('"type" (collection name) parameter is required when retrieving connections');
        }
        if (!_.isString(options.uuidOrName)) {
            throw new Error('target entity "uuidOrName" is required when retrieving connections');
        }
        options.uri = UsergridHelpers.urljoin(client.baseUrl, client.orgId, client.appId, _.isString(options.type) ? options.type : "", _.isString(options.uuidOrName) ? options.uuidOrName : "", options.direction, options.relationship);
        return new UsergridRequest(options);
    };
    global[name] = UsergridHelpers;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return UsergridHelpers;
    };
    return global[name];
})(this);

"use strict";

var defaultOptions = {
    baseUrl: "https://api.usergrid.com",
    authMode: UsergridAuthMode.USER
};

var UsergridClient = function(options) {
    var self = this;
    var __appAuth;
    self.tempAuth = undefined;
    self.isSharedInstance = false;
    if (arguments.length === 2) {
        self.orgId = arguments[0];
        self.appId = arguments[1];
    }
    _.defaults(self, options, defaultOptions);
    if (!self.orgId || !self.appId) {
        throw new Error('"orgId" and "appId" parameters are required when instantiating UsergridClient');
    }
    Object.defineProperty(self, "clientId", {
        enumerable: false
    });
    Object.defineProperty(self, "clientSecret", {
        enumerable: false
    });
    Object.defineProperty(self, "appAuth", {
        get: function() {
            return __appAuth;
        },
        set: function(options) {
            if (options instanceof UsergridAppAuth) {
                __appAuth = options;
            } else if (typeof options !== "undefined") {
                __appAuth = new UsergridAppAuth(options);
            }
        }
    });
    if (self.clientId && self.clientSecret) {
        self.setAppAuth(self.clientId, self.clientSecret);
    }
    return self;
};

UsergridClient.prototype = {
    GET: function(options, callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({
            client: self,
            method: UsergridHttpMethod.GET,
            uri: UsergridHelpers.uri(self, UsergridHttpMethod.GET, options),
            query: options instanceof UsergridQuery ? options : options.query,
            queryParams: options.queryParams,
            body: UsergridHelpers.body(options)
        }), callback);
    },
    PUT: function(options, callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({
            client: self,
            method: UsergridHttpMethod.PUT,
            uri: UsergridHelpers.uri(self, UsergridHttpMethod.PUT, options),
            query: options instanceof UsergridQuery ? options : options.query,
            queryParams: options.queryParams,
            body: UsergridHelpers.body(options)
        }), callback);
    },
    POST: function(options, callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({
            client: self,
            method: UsergridHttpMethod.POST,
            uri: UsergridHelpers.uri(self, UsergridHttpMethod.POST, options),
            query: options instanceof UsergridQuery ? options : options.query,
            queryParams: options.queryParams,
            body: UsergridHelpers.body(options)
        }), callback);
    },
    DELETE: function(options, callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({
            client: self,
            method: UsergridHttpMethod.DELETE,
            uri: UsergridHelpers.uri(self, UsergridHttpMethod.DELETE, options),
            query: options instanceof UsergridQuery ? options : options.query,
            queryParams: options.queryParams,
            body: UsergridHelpers.body(options)
        }), callback);
    },
    connect: function() {
        var self = this;
        return self.performRequest(UsergridHelpers.buildConnectionRequest(self, UsergridHttpMethod.POST, UsergridHelpers.flattenArgs(arguments)), UsergridHelpers.callback(arguments));
    },
    disconnect: function() {
        var self = this;
        return self.performRequest(UsergridHelpers.buildConnectionRequest(self, UsergridHttpMethod.DELETE, UsergridHelpers.flattenArgs(arguments)), UsergridHelpers.callback(arguments));
    },
    getConnections: function() {
        var self = this;
        return self.performRequest(UsergridHelpers.buildGetConnectionRequest(self, UsergridHelpers.flattenArgs(arguments)), UsergridHelpers.callback(arguments));
    },
    setAppAuth: function() {
        this.appAuth = new UsergridAppAuth(UsergridHelpers.flattenArgs(arguments));
    },
    authenticateApp: function(options) {
        var self = this;
        var callback = UsergridHelpers.callback(UsergridHelpers.flattenArgs(arguments));
        var auth = _.first([ options, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret) ].filter(function(p) {
            return p instanceof UsergridAppAuth;
        }));
        if (!(auth instanceof UsergridAppAuth)) {
            throw new Error("App auth context was not defined when attempting to call .authenticateApp()");
        } else if (!auth.clientId || !auth.clientSecret) {
            throw new Error("authenticateApp() failed because clientId or clientSecret are missing");
        }
        var authCallback = function(usergridResponse) {
            if (usergridResponse.ok) {
                if (!self.appAuth) {
                    self.appAuth = auth;
                }
                self.appAuth.token = _.get(usergridResponse.responseJSON, "access_token");
                var expiresIn = _.get(usergridResponse.responseJSON, "expires_in");
                self.appAuth.expiry = UsergridHelpers.calculateExpiry(expiresIn);
                self.appAuth.tokenTtl = expiresIn;
            }
            callback(usergridResponse);
        };
        return self.performRequest(new UsergridRequest({
            client: self,
            method: UsergridHttpMethod.POST,
            uri: UsergridHelpers.uri(self, UsergridHttpMethod.POST, {
                path: "token"
            }),
            body: UsergridHelpers.appLoginBody(auth)
        }), authCallback);
    },
    authenticateUser: function(options) {
        var self = this;
        var args = UsergridHelpers.flattenArgs(arguments);
        var callback = UsergridHelpers.callback(args);
        var setAsCurrentUser = _.last(args.filter(_.isBoolean)) !== undefined ? _.last(args.filter(_.isBoolean)) : true;
        var currentUser = new UsergridUser(options);
        currentUser.login(self, function(auth, user, usergridResponse) {
            if (usergridResponse.ok && setAsCurrentUser) {
                self.currentUser = currentUser;
            }
            callback(auth, user, usergridResponse);
        });
    },
    usingAuth: function(auth) {
        if (_.isString(auth)) {
            this.tempAuth = new UsergridAuth(auth);
        } else if (auth instanceof UsergridAuth) {
            this.tempAuth = auth;
        } else {
            this.tempAuth = undefined;
        }
        return this;
    },
    downloadAsset: function(entity, callback) {
        var self = this;
        var uploadRequest = new UsergridRequest({
            client: self,
            method: UsergridHttpMethod.GET,
            uri: UsergridHelpers.uri(self, UsergridHttpMethod.GET, entity)
        });
        return self.performAssetDownloadRequest(uploadRequest, entity, callback);
    },
    uploadAsset: function(entity, asset, callback) {
        var self = this;
        var method = UsergridHttpMethod.PUT;
        var uploadRequest = new UsergridRequest({
            client: self,
            method: method,
            uri: UsergridHelpers.uri(self, method, entity),
            asset: asset
        });
        return self.performAssetUploadRequest(uploadRequest, entity, callback);
    },
    performRequest: function(usergridRequest, callback) {
        var self = this;
        var requestPromise = function() {
            var promise = new Promise();
            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open(usergridRequest.method.toString(), usergridRequest.uri);
            _.forOwn(usergridRequest.headers, function(value, key) {
                xmlHttpRequest.setRequestHeader(key, value);
            });
            xmlHttpRequest.open = function() {
                if (usergridRequest.body !== undefined) {
                    xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
                    xmlHttpRequest.setRequestHeader("Accept", "application/json");
                }
            };
            xmlHttpRequest.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE) {
                    promise.done(xmlHttpRequest);
                }
            };
            xmlHttpRequest.send(UsergridHelpers.encode(usergridRequest.body));
            return promise;
        }.bind(self);
        var responsePromise = function(xmlRequest) {
            var promise = new Promise();
            var usergridResponse = new UsergridResponse(xmlRequest);
            promise.done(usergridResponse);
            return promise;
        }.bind(self);
        var onCompletePromise = function(response) {
            var promise = new Promise();
            response.request = usergridRequest;
            promise.done(response);
            UsergridHelpers.doCallback(callback, [ response ]);
        }.bind(self);
        Promise.chain([ requestPromise, responsePromise ]).then(onCompletePromise);
        return usergridRequest;
    },
    performAssetDownloadRequest: function(usergridRequest, entity, callback) {
        var req = new XMLHttpRequest();
        req.open("GET", usergridRequest.uri, true);
        req.setRequestHeader("Accept", _.get(entity, "file-metadata.content-type"));
        req.responseType = "blob";
        req.onload = function() {
            entity.asset = new UsergridAsset(req.response);
            UsergridHelpers.doCallback(callback, [ entity.asset, null, entity ]);
        };
        req.send(null);
        return usergridRequest;
    },
    performAssetUploadRequest: function(usergridRequest, entity, callback) {
        var asset = usergridRequest.asset;
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open(usergridRequest.method, usergridRequest.uri, true);
        xmlHttpRequest.onload = function() {
            var response = new UsergridResponse(xmlHttpRequest);
            UsergridHelpers.updateEntityFromRemote(entity, response);
            UsergridHelpers.doCallback(callback, [ asset, response, entity ]);
        };
        var formData = new FormData();
        formData.append("file", asset.data);
        xmlHttpRequest.send(formData);
        return usergridRequest;
    }
};

"use strict";

var UsergridSDKVersion = "2.0.0";

var UsergridClientSharedInstance = function() {
    var self = this;
    self.isInitialized = false;
    self.isSharedInstance = true;
    return self;
};

UsergridHelpers.inherits(UsergridClientSharedInstance, UsergridClient);

var Usergrid = new UsergridClientSharedInstance();

Usergrid.initSharedInstance = function(options) {
    if (Usergrid.isInitialized) {
        console.log("Usergrid shared instance is already initialized");
    } else {
        _.assign(Usergrid, new UsergridClient(options));
        Usergrid.isInitialized = true;
        Usergrid.isSharedInstance = true;
    }
    return Usergrid;
};

Usergrid.init = Usergrid.initSharedInstance;

"use strict";

var UsergridQuery = function(type) {
    var self = this;
    var query = "", queryString, sort, __nextIsNot = false;
    self._type = type;
    _.assign(self, {
        type: function(value) {
            self._type = value;
            return self;
        },
        collection: function(value) {
            self._type = value;
            return self;
        },
        limit: function(value) {
            self._limit = value;
            return self;
        },
        cursor: function(value) {
            self._cursor = value;
            return self;
        },
        eq: function(key, value) {
            query = self.andJoin(key + " " + UsergridQueryOperator.EQUAL + " " + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        equal: this.eq,
        gt: function(key, value) {
            query = self.andJoin(key + " " + UsergridQueryOperator.GREATER_THAN + " " + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        greaterThan: this.gt,
        gte: function(key, value) {
            query = self.andJoin(key + " " + UsergridQueryOperator.GREATER_THAN_EQUAL_TO + " " + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        greaterThanOrEqual: this.gte,
        lt: function(key, value) {
            query = self.andJoin(key + " " + UsergridQueryOperator.LESS_THAN + " " + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        lessThan: this.lt,
        lte: function(key, value) {
            query = self.andJoin(key + " " + UsergridQueryOperator.LESS_THAN_EQUAL_TO + " " + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        lessThanOrEqual: this.lte,
        contains: function(key, value) {
            query = self.andJoin(key + " contains " + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        locationWithin: function(distanceInMeters, lat, lng) {
            query = self.andJoin("location within " + distanceInMeters + " of " + lat + ", " + lng);
            return self;
        },
        asc: function(key) {
            self.sort(key, UsergridQuerySortOrder.ASC);
            return self;
        },
        desc: function(key) {
            self.sort(key, UsergridQuerySortOrder.DESC);
            return self;
        },
        sort: function(key, order) {
            sort = key && order ? " order by " + key + " " + order : "";
            return self;
        },
        fromString: function(string) {
            queryString = string;
            return self;
        },
        andJoin: function(append) {
            if (__nextIsNot) {
                append = "not " + append;
                __nextIsNot = false;
            }
            if (!append) {
                return query;
            } else if (query.length === 0) {
                return append;
            } else {
                return _.endsWith(query, "and") || _.endsWith(query, "or") ? query + " " + append : query + " and " + append;
            }
        },
        orJoin: function() {
            return query.length > 0 && !_.endsWith(query, "or") ? query + " or" : query;
        }
    });
    Object.defineProperty(self, "_ql", {
        get: function() {
            if (queryString !== undefined) {
                return queryString;
            } else {
                return "select *" + (query.length > 0 || sort !== undefined ? " where " + (query || "") + (sort || "") : "");
            }
        }
    });
    Object.defineProperty(self, "encodedStringValue", {
        get: function() {
            var self = this;
            var limit = self._limit;
            var cursor = self._cursor;
            var requirementsString = self._ql;
            var encodedStringValue = undefined;
            if (limit !== undefined) {
                encodedStringValue = "limit" + UsergridQueryOperator.EQUAL + limit;
            }
            if (!_.isEmpty(cursor)) {
                var cursorString = "cursor" + UsergridQueryOperator.EQUAL + cursor;
                if (_.isEmpty(encodedStringValue)) {
                    encodedStringValue = cursorString;
                } else {
                    encodedStringValue += "&" + cursorString;
                }
            }
            if (!_.isEmpty(requirementsString)) {
                var qLString = "ql=" + encodeURIComponent(requirementsString);
                if (_.isEmpty(encodedStringValue)) {
                    encodedStringValue = qLString;
                } else {
                    encodedStringValue += "&" + qLString;
                }
            }
            if (!_.isEmpty(encodedStringValue)) {
                encodedStringValue = "?" + encodedStringValue;
            }
            return !_.isEmpty(encodedStringValue) ? encodedStringValue : undefined;
        }
    });
    Object.defineProperty(self, "and", {
        get: function() {
            query = self.andJoin("");
            return self;
        }
    });
    Object.defineProperty(self, "or", {
        get: function() {
            query = self.orJoin();
            return self;
        }
    });
    Object.defineProperty(self, "not", {
        get: function() {
            __nextIsNot = true;
            return self;
        }
    });
    return self;
};

"use strict";

var UsergridRequest = function(options) {
    var self = this;
    var client = UsergridHelpers.validateAndRetrieveClient(options);
    if (!_.isString(options.type) && !_.isString(options.path) && !_.isString(options.uri)) {
        throw new Error('one of "type" (collection name), "path", or "uri" parameters are required when initializing a UsergridRequest');
    }
    if (!_.includes([ "GET", "PUT", "POST", "DELETE" ], options.method)) {
        throw new Error('"method" parameter is required when initializing a UsergridRequest');
    }
    self.method = options.method;
    self.uri = options.uri || UsergridHelpers.uri(client, options);
    self.headers = UsergridHelpers.headers(client, options);
    self.body = options.body || undefined;
    self.asset = options.asset || undefined;
    self.query = options.query;
    if (self.query !== undefined) {
        self.uri += UsergridHelpers.normalize(self.query.encodedStringValue, {});
    }
    self.queryParams = options.queryParams;
    if (self.queryParams !== undefined) {
        _.forOwn(self.queryParams, function(value, key) {
            self.uri += "?" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
        });
        self.uri = UsergridHelpers.normalize(self.uri, {});
    }
    try {
        if (_.isPlainObject(self.body)) {
            self.body = JSON.stringify(self.body);
        }
        if (_.isArray(self.body)) {
            self.body = JSON.stringify(self.body);
        }
    } catch (exception) {}
    return self;
};

"use strict";

var UsergridAuth = function(token, expiry) {
    var self = this;
    self.token = token;
    self.expiry = expiry || 0;
    var usingToken = token ? true : false;
    Object.defineProperty(self, "hasToken", {
        get: function() {
            return self.token !== undefined;
        },
        configurable: true
    });
    Object.defineProperty(self, "isExpired", {
        get: function() {
            return usingToken ? false : Date.now() >= self.expiry;
        },
        configurable: true
    });
    Object.defineProperty(self, "isValid", {
        get: function() {
            return !self.isExpired && self.hasToken;
        },
        configurable: true
    });
    Object.defineProperty(self, "tokenTtl", {
        configurable: true,
        writable: true
    });
    _.assign(self, {
        destroy: function() {
            self.token = undefined;
            self.expiry = 0;
            self.tokenTtl = undefined;
        }
    });
    return self;
};

var UsergridAppAuth = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    if (_.isPlainObject(args[0])) {
        self.clientId = args[0].clientId;
        self.clientSecret = args[0].clientSecret;
        self.tokenTtl = args[0].tokenTtl;
    } else {
        self.clientId = args[0];
        self.clientSecret = args[1];
        self.tokenTtl = args[2];
    }
    UsergridAuth.call(self);
    _.assign(self, UsergridAuth);
    return self;
};

UsergridHelpers.inherits(UsergridAppAuth, UsergridAuth);

var UsergridUserAuth = function(options) {
    var self = this;
    var args = _.flattenDeep(UsergridHelpers.flattenArgs(arguments));
    if (_.isPlainObject(args[0])) {
        options = args[0];
    }
    self.username = options.username || args[0];
    self.email = options.email;
    if (options.password || args[1]) {
        self.password = options.password || args[1];
    }
    self.tokenTtl = options.tokenTtl || args[2];
    UsergridAuth.call(self);
    _.assign(self, UsergridAuth);
    return self;
};

UsergridHelpers.inherits(UsergridUserAuth, UsergridAuth);

"use strict";

var UsergridEntity = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    if (args.length === 0) {
        throw new Error("A UsergridEntity object cannot be initialized without passing one or more arguments");
    }
    self.asset = undefined;
    if (_.isPlainObject(args[0])) {
        _.assign(self, args[0]);
    } else {
        if (!self.type) {
            self.type = _.isString(args[0]) ? args[0] : undefined;
        }
        if (!self.name) {
            self.name = _.isString(args[1]) ? args[1] : undefined;
        }
    }
    if (!_.isString(self.type)) {
        throw new Error('"type" (or "collection") parameter is required when initializing a UsergridEntity object');
    }
    Object.defineProperty(self, "isUser", {
        get: function() {
            return self.type.toLowerCase() === "user";
        }
    });
    Object.defineProperty(self, "hasAsset", {
        get: function() {
            return _.has(self, "file-metadata");
        }
    });
    UsergridHelpers.setReadOnly(self, [ "uuid", "name", "type", "created" ]);
    return self;
};

UsergridEntity.prototype = {
    jsonValue: function() {
        var jsonValue = {};
        _.forOwn(this, function(value, key) {
            jsonValue[key] = value;
        });
        return jsonValue;
    },
    putProperty: function(key, value) {
        this[key] = value;
    },
    putProperties: function(obj) {
        _.assign(this, obj);
    },
    removeProperty: function(key) {
        this.removeProperties([ key ]);
    },
    removeProperties: function(keys) {
        var self = this;
        keys.forEach(function(key) {
            delete self[key];
        });
    },
    insert: function(key, value, idx) {
        if (!_.isArray(this[key])) {
            this[key] = this[key] ? [ this[key] ] : [];
        }
        this[key].splice.apply(this[key], [ idx, 0 ].concat(value));
    },
    append: function(key, value) {
        this.insert(key, value, Number.MAX_VALUE);
    },
    prepend: function(key, value) {
        this.insert(key, value, 0);
    },
    pop: function(key) {
        if (_.isArray(this[key])) {
            this[key].pop();
        }
    },
    shift: function(key) {
        if (_.isArray(this[key])) {
            this[key].shift();
        }
    },
    reload: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var callback = UsergridHelpers.callback(args);
        client.GET(this, function(usergridResponse) {
            UsergridHelpers.updateEntityFromRemote(this, usergridResponse);
            callback(usergridResponse);
        }.bind(this));
    },
    save: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var callback = UsergridHelpers.callback(args);
        var uuid = this.uuid;
        if (uuid === undefined) {
            client.POST(this, function(usergridResponse) {
                UsergridHelpers.updateEntityFromRemote(this, usergridResponse);
                callback(usergridResponse, this);
            }.bind(this));
        } else {
            client.PUT(this, function(usergridResponse) {
                UsergridHelpers.updateEntityFromRemote(this, usergridResponse);
                callback(usergridResponse, this);
            }.bind(this));
        }
    },
    remove: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var callback = UsergridHelpers.callback(args);
        client.DELETE(this, function(usergridResponse) {
            callback(usergridResponse, this);
        }.bind(this));
    },
    attachAsset: function(asset) {
        this.asset = asset;
    },
    uploadAsset: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var callback = UsergridHelpers.callback(args);
        client.uploadAsset(this, this.asset, function(asset, usergridResponse) {
            UsergridHelpers.updateEntityFromRemote(this, usergridResponse);
            this.asset = asset;
            callback(asset, usergridResponse, this);
        }.bind(this));
    },
    downloadAsset: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var callback = UsergridHelpers.callback(args);
        client.downloadAsset(this, callback);
    },
    connect: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        args[0] = this;
        return client.connect.apply(client, args);
    },
    disconnect: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        args[0] = this;
        return client.disconnect.apply(client, args);
    },
    getConnections: function() {
        var args = UsergridHelpers.flattenArgs(arguments);
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        args.shift();
        args.splice(1, 0, this);
        return client.getConnections.apply(client, args);
    }
};

"use strict";

var UsergridUser = function(obj) {
    if (!_.has(obj, "email") && !_.has(obj, "username")) {
        throw new Error('"email" or "username" property is required when initializing a UsergridUser object');
    }
    var self = this;
    _.assign(self, obj, UsergridEntity);
    UsergridEntity.call(self, "user");
    UsergridHelpers.setWritable(self, "name");
    return self;
};

UsergridUser.CheckAvailable = function() {
    var args = UsergridHelpers.flattenArgs(arguments);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    if (args[0] instanceof UsergridClient) {
        args.shift();
    }
    var callback = UsergridHelpers.callback(args);
    var checkQuery;
    if (args[0].username && args[0].email) {
        checkQuery = new UsergridQuery("users").eq("username", args[0].username).or.eq("email", args[0].email);
    } else if (args[0].username) {
        checkQuery = new UsergridQuery("users").eq("username", args[0].username);
    } else if (args[0].email) {
        checkQuery = new UsergridQuery("users").eq("email", args[0].email);
    } else {
        throw new Error("'username' or 'email' property is required when checking for available users");
    }
    client.GET(checkQuery, function(usergridResponse) {
        callback(usergridResponse, usergridResponse.entities.length > 0);
    });
};

UsergridHelpers.inherits(UsergridUser, UsergridEntity);

UsergridUser.prototype.uniqueId = function() {
    var self = this;
    return _.first([ self.uuid, self.username, self.email ].filter(_.isString));
};

UsergridUser.prototype.create = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    var callback = UsergridHelpers.callback(args);
    client.POST(self, function(usergridResponse) {
        delete self.password;
        _.assign(self, usergridResponse.user);
        callback(usergridResponse);
    }.bind(self));
};

UsergridUser.prototype.login = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var callback = UsergridHelpers.callback(args);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    client.POST({
        path: "token",
        body: UsergridHelpers.userLoginBody(self)
    }, function(usergridResponse) {
        delete self.password;
        if (usergridResponse.ok) {
            var responseJSON = usergridResponse.responseJSON;
            self.auth = new UsergridUserAuth(self);
            self.auth.token = _.get(responseJSON, "access_token");
            var expiresIn = _.get(responseJSON, "expires_in");
            self.auth.expiry = UsergridHelpers.calculateExpiry(expiresIn);
            self.auth.tokenTtl = expiresIn;
        }
        callback(self.auth, self, usergridResponse);
    });
};

UsergridUser.prototype.logout = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var callback = UsergridHelpers.callback(args);
    if (!self.auth || !self.auth.isValid) {
        var response = new UsergridResponse();
        response.error = new UsergridResponseError({
            error: "no_valid_token",
            description: "this user does not have a valid token"
        });
        return callback(response);
    }
    var revokeAll = _.first(args.filter(_.isBoolean)) || false;
    var revokeTokenPath = [ "users", self.uniqueId(), "revoketoken" + (revokeAll ? "s" : "") ].join("/");
    var queryParams = undefined;
    if (!revokeAll) {
        queryParams = {
            token: self.auth.token
        };
    }
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    return client.PUT({
        path: revokeTokenPath,
        queryParams: queryParams
    }, function(usergridResponse) {
        self.auth.destroy();
        callback(usergridResponse);
    });
};

UsergridUser.prototype.logoutAllSessions = function() {
    var args = UsergridHelpers.flattenArgs(arguments);
    args = _.concat([ UsergridHelpers.validateAndRetrieveClient(args), true ], args);
    return this.logout.apply(this, args);
};

UsergridUser.prototype.resetPassword = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var callback = UsergridHelpers.callback(args);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    if (args[0] instanceof UsergridClient) {
        args.shift();
    }
    var body = {
        oldpassword: _.isPlainObject(args[0]) ? args[0].oldPassword : _.isString(args[0]) ? args[0] : undefined,
        newpassword: _.isPlainObject(args[0]) ? args[0].newPassword : _.isString(args[1]) ? args[1] : undefined
    };
    if (!body.oldpassword || !body.newpassword) {
        throw new Error('"oldPassword" and "newPassword" properties are required when resetting a user password');
    }
    return client.PUT({
        path: [ "users", self.uniqueId(), "password" ].join("/"),
        body: body
    }, function(usergridResponse) {
        callback(usergridResponse);
    });
};

"use strict";

var UsergridResponseError = function(responseErrorObject) {
    var self = this;
    if (_.has(responseErrorObject, "error") === false) {
        return;
    }
    self.name = responseErrorObject.error;
    self.description = responseErrorObject.error_description || responseErrorObject.description;
    self.exception = responseErrorObject.exception;
    return self;
};

var UsergridResponse = function(request) {
    var self = this;
    self.ok = false;
    if (request) {
        self.statusCode = parseInt(request.status);
        self.headers = UsergridHelpers.parseResponseHeaders(request.getAllResponseHeaders());
        try {
            var responseText = request.responseText;
            var responseJSON = JSON.parse(responseText);
        } catch (e) {
            responseJSON = {};
        }
        if (self.statusCode < 400) {
            self.ok = true;
            _.assign(self, {
                responseJSON: _.cloneDeep(responseJSON)
            });
            if (_.has(responseJSON, "entities")) {
                var entities = _.map(responseJSON.entities, function(en) {
                    var entity = new UsergridEntity(en);
                    if (entity.isUser) {
                        entity = new UsergridUser(entity);
                    }
                    return entity;
                });
                _.assign(self, {
                    entities: entities
                });
                delete self.responseJSON.entities;
                self.first = _.first(entities) || undefined;
                self.entity = self.first;
                self.last = _.last(entities) || undefined;
                if (_.get(self, "responseJSON.path") === "/users") {
                    self.user = self.first;
                    self.users = self.entities;
                }
                Object.defineProperty(self, "hasNextPage", {
                    get: function() {
                        return _.has(self, "responseJSON.cursor");
                    }
                });
                UsergridHelpers.setReadOnly(self.responseJSON);
            }
        } else {
            self.error = new UsergridResponseError(responseJSON);
        }
    }
    return self;
};

UsergridResponse.prototype = {
    loadNextPage: function() {
        var self = this;
        var args = UsergridHelpers.flattenArgs(arguments);
        var callback = UsergridHelpers.callback(args);
        if (!self.responseJSON.cursor) {
            callback();
        }
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var type = _.last(_.get(self, "responseJSON.path").split("/"));
        var limit = _.first(_.get(this, "responseJSON.params.limit"));
        var query = new UsergridQuery(type).cursor(this.responseJSON.cursor).limit(limit);
        return client.GET(query, callback);
    }
};

"use strict";

var UsergridAssetDefaultFileName = "file";

var UsergridAsset = function(fileOrBlob) {
    if (!fileOrBlob instanceof File || !fileOrBlob instanceof Blob) {
        throw new Error("UsergridAsset must be initialized with a 'File' or 'Blob'");
    }
    var self = this;
    self.data = fileOrBlob;
    self.filename = fileOrBlob.name || UsergridAssetDefaultFileName;
    self.contentLength = fileOrBlob.size;
    self.contentType = fileOrBlob.type;
    return self;
};