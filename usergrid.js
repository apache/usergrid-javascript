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
 * usergrid@0.11.0 2016-09-19 
 */
var UsergridEventable = function() {
    throw Error("'UsergridEventable' is not intended to be invoked directly");
};

UsergridEventable.prototype = {
    bind: function(event, fn) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(fn);
    },
    unbind: function(event, fn) {
        this._events = this._events || {};
        if (event in this._events === false) return;
        this._events[event].splice(this._events[event].indexOf(fn), 1);
    },
    trigger: function(event) {
        this._events = this._events || {};
        if (event in this._events === false) return;
        for (var i = 0; i < this._events[event].length; i++) {
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
};

UsergridEventable.mixin = function(destObject) {
    var props = [ "bind", "unbind", "trigger" ];
    for (var i = 0; i < props.length; i++) {
        if (props[i] in destObject.prototype) {
            console.warn("overwriting '" + props[i] + "' on '" + destObject.name + "'.");
            console.warn("the previous version can be found at '_" + props[i] + "' on '" + destObject.name + "'.");
            destObject.prototype["_" + props[i]] = destObject.prototype[props[i]];
        }
        destObject.prototype[props[i]] = UsergridEventable.prototype[props[i]];
    }
};

(function() {
    var name = "Logger", global = this, overwrittenName = global[name], exports;
    /* logging */
    function Logger(name) {
        this.logEnabled = true;
        this.init(name, true);
    }
    Logger.METHODS = [ "log", "error", "warn", "info", "debug", "assert", "clear", "count", "dir", "dirxml", "exception", "group", "groupCollapsed", "groupEnd", "profile", "profileEnd", "table", "time", "timeEnd", "trace" ];
    Logger.prototype.init = function(name, logEnabled) {
        this.name = name || "UNKNOWN";
        this.logEnabled = logEnabled || true;
        var addMethod = function(method) {
            this[method] = this.createLogMethod(method);
        }.bind(this);
        Logger.METHODS.forEach(addMethod);
    };
    Logger.prototype.createLogMethod = function(method) {
        return Logger.prototype.log.bind(this, method);
    };
    Logger.prototype.prefix = function(method, args) {
        var prepend = "[" + method.toUpperCase() + "][" + name + "]:	";
        if ([ "log", "error", "warn", "info" ].indexOf(method) !== -1) {
            if ("string" === typeof args[0]) {
                args[0] = prepend + args[0];
            } else {
                args.unshift(prepend);
            }
        }
        return args;
    };
    Logger.prototype.log = function() {
        var args = [].slice.call(arguments);
        var method = args.shift();
        if (Logger.METHODS.indexOf(method) === -1) {
            method = "log";
        }
        if (!(this.logEnabled && console && console[method])) return;
        args = this.prefix(method, args);
        console[method].apply(console, args);
    };
    Logger.prototype.setLogEnabled = function(logEnabled) {
        this.logEnabled = logEnabled || true;
    };
    Logger.mixin = function(destObject) {
        destObject.__logger = new Logger(destObject.name || "UNKNOWN");
        var addMethod = function(method) {
            if (method in destObject.prototype) {
                console.warn("overwriting '" + method + "' on '" + destObject.name + "'.");
                console.warn("the previous version can be found at '_" + method + "' on '" + destObject.name + "'.");
                destObject.prototype["_" + method] = destObject.prototype[method];
            }
            destObject.prototype[method] = destObject.__logger.createLogMethod(method);
        };
        Logger.METHODS.forEach(addMethod);
    };
    global[name] = Logger;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Logger;
    };
    return global[name];
})();

(function(global) {
    var name = "Promise", overwrittenName = global[name], exports;
    function Promise() {
        this.complete = false;
        this.error = null;
        this.result = null;
        this.callbacks = [];
    }
    Promise.prototype.then = function(callback, context) {
        var f = function() {
            return callback.apply(context, arguments);
        };
        if (this.complete) {
            f(this.error, this.result);
        } else {
            this.callbacks.push(f);
        }
    };
    Promise.prototype.done = function(error, result) {
        this.complete = true;
        this.error = error;
        this.result = result;
        if (this.callbacks) {
            for (var i = 0; i < this.callbacks.length; i++) this.callbacks[i](error, result);
            this.callbacks.length = 0;
        }
    };
    Promise.join = function(promises) {
        var p = new Promise(), total = promises.length, completed = 0, errors = [], results = [];
        function notifier(i) {
            return function(error, result) {
                completed += 1;
                errors[i] = error;
                results[i] = result;
                if (completed === total) {
                    p.done(errors, results);
                }
            };
        }
        for (var i = 0; i < total; i++) {
            promises[i]().then(notifier(i));
        }
        return p;
    };
    Promise.chain = function(promises, error, result) {
        var p = new Promise();
        if (promises === null || promises.length === 0) {
            p.done(error, result);
        } else {
            promises[0](error, result).then(function(res, err) {
                promises.splice(0, 1);
                if (promises) {
                    Promise.chain(promises, res, err).then(function(r, e) {
                        p.done(r, e);
                    });
                } else {
                    p.done(res, err);
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
    var name = "Ajax", global = this, overwrittenName = global[name], exports;
    function partial() {
        var args = Array.prototype.slice.call(arguments);
        var fn = args.shift();
        return fn.bind(this, args);
    }
    function Ajax() {
        this.logger = new global.Logger(name);
        var self = this;
        function encode(data) {
            var result = "";
            if (typeof data === "string") {
                result = data;
            } else {
                var e = encodeURIComponent;
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        result += "&" + e(i) + "=" + e(data[i]);
                    }
                }
            }
            return result;
        }
        function request(m, u, d) {
            var p = new Promise(), timeout;
            self.logger.time(m + " " + u);
            (function(xhr) {
                xhr.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        self.logger.timeEnd(m + " " + u);
                        clearTimeout(timeout);
                        p.done(null, this);
                    }
                };
                xhr.onerror = function(response) {
                    clearTimeout(timeout);
                    p.done(response, null);
                };
                xhr.oncomplete = function(response) {
                    clearTimeout(timeout);
                    self.logger.timeEnd(m + " " + u);
                    self.info("%s request to %s returned %s", m, u, this.status);
                };
                xhr.open(m, u);
                if (d) {
                    if ("object" === typeof d) {
                        d = JSON.stringify(d);
                    }
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("Accept", "application/json");
                }
                timeout = setTimeout(function() {
                    xhr.abort();
                    p.done("API Call timed out.", null);
                }, 3e4);
                xhr.send(encode(d));
            })(new XMLHttpRequest());
            return p;
        }
        this.request = request;
        this.get = partial(request, "GET");
        this.post = partial(request, "POST");
        this.put = partial(request, "PUT");
        this.delete = partial(request, "DELETE");
    }
    global[name] = new Ajax();
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return exports;
    };
    return global[name];
})();

(function() {
    /** Used as a safe reference for `undefined` in pre-ES5 environments. */
    var undefined;
    /** Used as the semantic version number. */
    var VERSION = "4.16.0";
    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT = "Expected a function";
    /** Used to compose bitmasks for function metadata. */
    var BIND_FLAG = 1, PARTIAL_FLAG = 32;
    /** Used to compose bitmasks for comparison styles. */
    var UNORDERED_COMPARE_FLAG = 1, PARTIAL_COMPARE_FLAG = 2;
    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991;
    /** `Object#toString` result references. */
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", stringTag = "[object String]";
    /** Used to match HTML entities and HTML characters. */
    var reUnescapedHtml = /[&<>"'`]/g, reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    /** Used to map characters to HTML entities. */
    var htmlEscapes = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    /** Detect free variable `self`. */
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function("return this")();
    /** Detect free variable `exports`. */
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    /*--------------------------------------------------------------------------*/
    /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
    function arrayPush(array, values) {
        array.push.apply(array, values);
        return array;
    }
    /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
        var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
        while (fromRight ? index-- : ++index < length) {
            if (predicate(array[index], index, array)) {
                return index;
            }
        }
        return -1;
    }
    /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
    function baseProperty(key) {
        return function(object) {
            return object == null ? undefined : object[key];
        };
    }
    /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
    function basePropertyOf(object) {
        return function(key) {
            return object == null ? undefined : object[key];
        };
    }
    /**
   * The base implementation of `_.reduce` and `_.reduceRight`, without support
   * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} accumulator The initial value.
   * @param {boolean} initAccum Specify using the first or last element of
   *  `collection` as the initial value.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the accumulated value.
   */
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
        eachFunc(collection, function(value, index, collection) {
            accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection);
        });
        return accumulator;
    }
    /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
    function baseValues(object, props) {
        return baseMap(props, function(key) {
            return object[key];
        });
    }
    /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
    function overArg(func, transform) {
        return function(arg) {
            return func(transform(arg));
        };
    }
    /*--------------------------------------------------------------------------*/
    /** Used for built-in method references. */
    var arrayProto = Array.prototype, objectProto = Object.prototype;
    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;
    /** Used to generate unique IDs. */
    var idCounter = 0;
    /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
    var objectToString = objectProto.toString;
    /** Used to restore the original `_` reference in `_.noConflict`. */
    var oldDash = root._;
    /** Built-in value references. */
    var objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable;
    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsFinite = root.isFinite, nativeKeys = overArg(Object.keys, Object), nativeMax = Math.max;
    /*------------------------------------------------------------------------*/
    /**
   * Creates a `lodash` object which wraps `value` to enable implicit method
   * chain sequences. Methods that operate on and return arrays, collections,
   * and functions can be chained together. Methods that retrieve a single value
   * or may return a primitive value will automatically end the chain sequence
   * and return the unwrapped value. Otherwise, the value must be unwrapped
   * with `_#value`.
   *
   * Explicit chain sequences, which must be unwrapped with `_#value`, may be
   * enabled using `_.chain`.
   *
   * The execution of chained methods is lazy, that is, it's deferred until
   * `_#value` is implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion.
   * Shortcut fusion is an optimization to merge iteratee calls; this avoids
   * the creation of intermediate arrays and can greatly reduce the number of
   * iteratee executions. Sections of a chain sequence qualify for shortcut
   * fusion if the section is applied to an array of at least `200` elements
   * and any iteratees accept only one argument. The heuristic for whether a
   * section qualifies for shortcut fusion is subject to change.
   *
   * Chaining is supported in custom builds as long as the `_#value` method is
   * directly or indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have `Array` and `String` methods.
   *
   * The wrapper `Array` methods are:
   * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
   *
   * The wrapper `String` methods are:
   * `replace` and `split`
   *
   * The wrapper methods that support shortcut fusion are:
   * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
   * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
   * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
   *
   * The chainable wrapper methods are:
   * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
   * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
   * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
   * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
   * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
   * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
   * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
   * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
   * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
   * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
   * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
   * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
   * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
   * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
   * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
   * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
   * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
   * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
   * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
   * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
   * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
   * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
   * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
   * `zipObject`, `zipObjectDeep`, and `zipWith`
   *
   * The wrapper methods that are **not** chainable by default are:
   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
   * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
   * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
   * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
   * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
   * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
   * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
   * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
   * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
   * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
   * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
   * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
   * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
   * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
   * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
   * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
   * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
   * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
   * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
   * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
   * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
   * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
   * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
   * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
   * `upperFirst`, `value`, and `words`
   *
   * @name _
   * @constructor
   * @category Seq
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // Returns an unwrapped value.
   * wrapped.reduce(_.add);
   * // => 6
   *
   * // Returns a wrapped value.
   * var squares = wrapped.map(square);
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
    function lodash(value) {
        return value instanceof LodashWrapper ? value : new LodashWrapper(value);
    }
    /**
   * The base constructor for creating `lodash` wrapper objects.
   *
   * @private
   * @param {*} value The value to wrap.
   * @param {boolean} [chainAll] Enable explicit method chain sequences.
   */
    function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
    }
    LodashWrapper.prototype = baseCreate(lodash.prototype);
    LodashWrapper.prototype.constructor = LodashWrapper;
    /*------------------------------------------------------------------------*/
    /**
   * Used by `_.defaults` to customize its `_.assignIn` use.
   *
   * @private
   * @param {*} objValue The destination value.
   * @param {*} srcValue The source value.
   * @param {string} key The key of the property to assign.
   * @param {Object} object The parent object of `objValue`.
   * @returns {*} Returns the value to assign.
   */
    function assignInDefaults(objValue, srcValue, key, object) {
        if (objValue === undefined || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
            return srcValue;
        }
        return objValue;
    }
    /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
    function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
            baseAssignValue(object, key, value);
        }
    }
    /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
    function baseAssignValue(object, key, value) {
        object[key] = value;
    }
    /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
    function baseCreate(proto) {
        return isObject(proto) ? objectCreate(proto) : {};
    }
    /**
   * The base implementation of `_.delay` and `_.defer` which accepts `args`
   * to provide to `func`.
   *
   * @private
   * @param {Function} func The function to delay.
   * @param {number} wait The number of milliseconds to delay invocation.
   * @param {Array} args The arguments to provide to `func`.
   * @returns {number|Object} Returns the timer id or timeout object.
   */
    function baseDelay(func, wait, args) {
        if (typeof func != "function") {
            throw new TypeError(FUNC_ERROR_TEXT);
        }
        return setTimeout(function() {
            func.apply(undefined, args);
        }, wait);
    }
    /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */
    var baseEach = createBaseEach(baseForOwn);
    /**
   * The base implementation of `_.every` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`
   */
    function baseEvery(collection, predicate) {
        var result = true;
        baseEach(collection, function(value, index, collection) {
            result = !!predicate(value, index, collection);
            return result;
        });
        return result;
    }
    /**
   * The base implementation of methods like `_.max` and `_.min` which accepts a
   * `comparator` to determine the extremum value.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The iteratee invoked per iteration.
   * @param {Function} comparator The comparator used to compare values.
   * @returns {*} Returns the extremum value.
   */
    function baseExtremum(array, iteratee, comparator) {
        var index = -1, length = array.length;
        while (++index < length) {
            var value = array[index], current = iteratee(value);
            if (current != null && (computed === undefined ? current === current && !false : comparator(current, computed))) {
                var computed = current, result = value;
            }
        }
        return result;
    }
    /**
   * The base implementation of `_.filter` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
    function baseFilter(collection, predicate) {
        var result = [];
        baseEach(collection, function(value, index, collection) {
            if (predicate(value, index, collection)) {
                result.push(value);
            }
        });
        return result;
    }
    /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
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
    /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
    var baseFor = createBaseFor();
    /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
    function baseForOwn(object, iteratee) {
        return object && baseFor(object, iteratee, keys);
    }
    /**
   * The base implementation of `_.functions` which creates an array of
   * `object` function property names filtered from `props`.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Array} props The property names to filter.
   * @returns {Array} Returns the function names.
   */
    function baseFunctions(object, props) {
        return baseFilter(props, function(key) {
            return isFunction(object[key]);
        });
    }
    /**
   * The base implementation of `_.gt` which doesn't coerce arguments.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if `value` is greater than `other`,
   *  else `false`.
   */
    function baseGt(value, other) {
        return value > other;
    }
    /**
   * The base implementation of `_.isDate` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
   */
    function baseIsDate(value) {
        return isObjectLike(value) && objectToString.call(value) == dateTag;
    }
    /**
   * The base implementation of `_.isEqual` which supports partial comparisons
   * and tracks traversed objects.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {Function} [customizer] The function to customize comparisons.
   * @param {boolean} [bitmask] The bitmask of comparison flags.
   *  The bitmask may be composed of the following flags:
   *     1 - Unordered comparison
   *     2 - Partial comparison
   * @param {Object} [stack] Tracks traversed `value` and `other` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
    function baseIsEqual(value, other, customizer, bitmask, stack) {
        if (value === other) {
            return true;
        }
        if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
            return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
    }
    /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} [customizer] The function to customize comparisons.
   * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
   *  for more details.
   * @param {Object} [stack] Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
    function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
        if (!objIsArr) {
            objTag = objectToString.call(object);
            objTag = objTag == argsTag ? objectTag : objTag;
        }
        if (!othIsArr) {
            othTag = objectToString.call(other);
            othTag = othTag == argsTag ? objectTag : othTag;
        }
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        stack || (stack = []);
        var objStack = find(stack, function(entry) {
            return entry[0] == object;
        });
        var othStack = find(stack, function(entry) {
            return entry[0] == other;
        });
        if (objStack && othStack) {
            return objStack[1] == other;
        }
        stack.push([ object, other ]);
        stack.push([ other, object ]);
        if (isSameTag && !objIsObj) {
            var result = objIsArr ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
            stack.pop();
            return result;
        }
        if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
            var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
            if (objIsWrapped || othIsWrapped) {
                var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
                var result = equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
                stack.pop();
                return result;
            }
        }
        if (!isSameTag) {
            return false;
        }
        var result = equalObjects(object, other, equalFunc, customizer, bitmask, stack);
        stack.pop();
        return result;
    }
    /**
   * The base implementation of `_.isRegExp` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
   */
    function baseIsRegExp(value) {
        return isObject(value) && objectToString.call(value) == regexpTag;
    }
    /**
   * The base implementation of `_.iteratee`.
   *
   * @private
   * @param {*} [value=_.identity] The value to convert to an iteratee.
   * @returns {Function} Returns the iteratee.
   */
    function baseIteratee(func) {
        if (typeof func == "function") {
            return func;
        }
        if (func == null) {
            return identity;
        }
        return (typeof func == "object" ? baseMatches : baseProperty)(func);
    }
    /**
   * The base implementation of `_.lt` which doesn't coerce arguments.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if `value` is less than `other`,
   *  else `false`.
   */
    function baseLt(value, other) {
        return value < other;
    }
    /**
   * The base implementation of `_.map` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
    function baseMap(collection, iteratee) {
        var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
        baseEach(collection, function(value, key, collection) {
            result[++index] = iteratee(value, key, collection);
        });
        return result;
    }
    /**
   * The base implementation of `_.matches` which doesn't clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   */
    function baseMatches(source) {
        var props = nativeKeys(source);
        return function(object) {
            var length = props.length;
            if (object == null) {
                return !length;
            }
            object = Object(object);
            while (length--) {
                var key = props[length];
                if (!(key in object && baseIsEqual(source[key], object[key], undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG))) {
                    return false;
                }
            }
            return true;
        };
    }
    /**
   * The base implementation of `_.pick` without support for individual
   * property identifiers.
   *
   * @private
   * @param {Object} object The source object.
   * @param {string[]} props The property identifiers to pick.
   * @returns {Object} Returns the new object.
   */
    function basePick(object, props) {
        object = Object(object);
        return reduce(props, function(result, key) {
            if (key in object) {
                result[key] = object[key];
            }
            return result;
        }, {});
    }
    /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
    function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + "");
    }
    /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
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
    /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
    function copyArray(source) {
        return baseSlice(source, 0, source.length);
    }
    /**
   * The base implementation of `_.some` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
    function baseSome(collection, predicate) {
        var result;
        baseEach(collection, function(value, index, collection) {
            result = predicate(value, index, collection);
            return !result;
        });
        return !!result;
    }
    /**
   * The base implementation of `wrapperValue` which returns the result of
   * performing a sequence of actions on the unwrapped `value`, where each
   * successive action is supplied the return value of the previous.
   *
   * @private
   * @param {*} value The unwrapped value.
   * @param {Array} actions Actions to perform to resolve the unwrapped value.
   * @returns {*} Returns the resolved value.
   */
    function baseWrapperValue(value, actions) {
        var result = value;
        return reduce(actions, function(result, action) {
            return action.func.apply(action.thisArg, arrayPush([ result ], action.args));
        }, result);
    }
    /**
   * Compares values to sort them in ascending order.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {number} Returns the sort order indicator for `value`.
   */
    function compareAscending(value, other) {
        if (value !== other) {
            var valIsDefined = value !== undefined, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = false;
            var othIsDefined = other !== undefined, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = false;
            if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
                return 1;
            }
            if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
                return -1;
            }
        }
        return 0;
    }
    /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
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
    /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
    function createAssigner(assigner) {
        return baseRest(function(object, sources) {
            var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined;
            customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, 
            customizer) : undefined;
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
    /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
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
    /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
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
    /**
   * Creates a function that produces an instance of `Ctor` regardless of
   * whether it was invoked as part of a `new` expression or by `call` or `apply`.
   *
   * @private
   * @param {Function} Ctor The constructor to wrap.
   * @returns {Function} Returns the new wrapped function.
   */
    function createCtor(Ctor) {
        return function() {
            var args = arguments;
            var thisBinding = baseCreate(Ctor.prototype), result = Ctor.apply(thisBinding, args);
            return isObject(result) ? result : thisBinding;
        };
    }
    /**
   * Creates a `_.find` or `_.findLast` function.
   *
   * @private
   * @param {Function} findIndexFunc The function to find the collection index.
   * @returns {Function} Returns the new find function.
   */
    function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
            var iterable = Object(collection);
            if (!isArrayLike(collection)) {
                var iteratee = baseIteratee(predicate, 3);
                collection = keys(collection);
                predicate = function(key) {
                    return iteratee(iterable[key], key, iterable);
                };
            }
            var index = findIndexFunc(collection, predicate, fromIndex);
            return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
        };
    }
    /**
   * Creates a function that wraps `func` to invoke it with the `this` binding
   * of `thisArg` and `partials` prepended to the arguments it receives.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} partials The arguments to prepend to those provided to
   *  the new function.
   * @returns {Function} Returns the new wrapped function.
   */
    function createPartial(func, bitmask, thisArg, partials) {
        if (typeof func != "function") {
            throw new TypeError(FUNC_ERROR_TEXT);
        }
        var isBind = bitmask & BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
            var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
            while (++leftIndex < leftLength) {
                args[leftIndex] = partials[leftIndex];
            }
            while (argsLength--) {
                args[leftIndex++] = arguments[++argsIndex];
            }
            return fn.apply(isBind ? thisArg : this, args);
        }
        return wrapper;
    }
    /**
   * A specialized version of `baseIsEqualDeep` for arrays with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Array} array The array to compare.
   * @param {Array} other The other array to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} customizer The function to customize comparisons.
   * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
   *  for more details.
   * @param {Object} stack Tracks traversed `array` and `other` objects.
   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
   */
    function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
        var isPartial = bitmask & PARTIAL_COMPARE_FLAG, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
            return false;
        }
        var index = -1, result = true, seen = bitmask & UNORDERED_COMPARE_FLAG ? [] : undefined;
        while (++index < arrLength) {
            var arrValue = array[index], othValue = other[index];
            var compared;
            if (compared !== undefined) {
                if (compared) {
                    continue;
                }
                result = false;
                break;
            }
            if (seen) {
                if (!baseSome(other, function(othValue, othIndex) {
                    if (!indexOf(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
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
        return result;
    }
    /**
   * A specialized version of `baseIsEqualDeep` for comparing objects of
   * the same `toStringTag`.
   *
   * **Note:** This function only supports comparing values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {string} tag The `toStringTag` of the objects to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} customizer The function to customize comparisons.
   * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
   *  for more details.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
    function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
        switch (tag) {
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);

          case errorTag:
            return object.name == other.name && object.message == other.message;

          case regexpTag:
          case stringTag:
            return object == other + "";
        }
        return false;
    }
    /**
   * A specialized version of `baseIsEqualDeep` for objects with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} customizer The function to customize comparisons.
   * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
   *  for more details.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
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
        var result = true;
        var skipCtor = isPartial;
        while (++index < objLength) {
            key = objProps[index];
            var objValue = object[key], othValue = other[key];
            var compared;
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
        return result;
    }
    /**
   * A specialized version of `baseRest` which flattens the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @returns {Function} Returns the new function.
   */
    function flatRest(func) {
        return setToString(overRest(func, undefined, flatten), func + "");
    }
    /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */
    function isFlattenable(value) {
        return isArray(value) || isArguments(value);
    }
    /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
    function nativeKeysIn(object) {
        var result = [];
        if (object != null) {
            for (var key in Object(object)) {
                result.push(key);
            }
        }
        return result;
    }
    /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
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
            return func.apply(this, otherArgs);
        };
    }
    /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
    var setToString = identity;
    /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
    var toKey = String;
    /*------------------------------------------------------------------------*/
    /**
   * Creates an array with all falsey values removed. The values `false`, `null`,
   * `0`, `""`, `undefined`, and `NaN` are falsey.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to compact.
   * @returns {Array} Returns the new array of filtered values.
   * @example
   *
   * _.compact([0, 1, false, 2, '', 3]);
   * // => [1, 2, 3]
   */
    function compact(array) {
        return baseFilter(array, Boolean);
    }
    /**
   * Creates a new array concatenating `array` with any additional arrays
   * and/or values.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Array
   * @param {Array} array The array to concatenate.
   * @param {...*} [values] The values to concatenate.
   * @returns {Array} Returns the new concatenated array.
   * @example
   *
   * var array = [1];
   * var other = _.concat(array, 2, [3], [[4]]);
   *
   * console.log(other);
   * // => [1, 2, 3, [4]]
   *
   * console.log(array);
   * // => [1]
   */
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
    /**
   * This method is like `_.find` except that it returns the index of the first
   * element `predicate` returns truthy for instead of the element itself.
   *
   * @static
   * @memberOf _
   * @since 1.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {Function} [predicate=_.identity]
   *  The function invoked per iteration.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the found element, else `-1`.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'active': false },
   *   { 'user': 'fred',    'active': false },
   *   { 'user': 'pebbles', 'active': true }
   * ];
   *
   * _.findIndex(users, function(o) { return o.user == 'barney'; });
   * // => 0
   *
   * // The `_.matches` iteratee shorthand.
   * _.findIndex(users, { 'user': 'fred', 'active': false });
   * // => 1
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.findIndex(users, ['active', false]);
   * // => 0
   *
   * // The `_.property` iteratee shorthand.
   * _.findIndex(users, 'active');
   * // => 2
   */
    function findIndex(array, predicate, fromIndex) {
        var length = array ? array.length : 0;
        if (!length) {
            return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
            index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array, baseIteratee(predicate, 3), index);
    }
    /**
   * Flattens `array` a single level deep.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flatten([1, [2, [3, [4]], 5]]);
   * // => [1, 2, [3, [4]], 5]
   */
    function flatten(array) {
        var length = array ? array.length : 0;
        return length ? baseFlatten(array, 1) : [];
    }
    /**
   * Recursively flattens `array`.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flattenDeep([1, [2, [3, [4]], 5]]);
   * // => [1, 2, 3, 4, 5]
   */
    function flattenDeep(array) {
        var length = array ? array.length : 0;
        return length ? baseFlatten(array, INFINITY) : [];
    }
    /**
   * Gets the first element of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias first
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the first element of `array`.
   * @example
   *
   * _.head([1, 2, 3]);
   * // => 1
   *
   * _.head([]);
   * // => undefined
   */
    function head(array) {
        return array && array.length ? array[0] : undefined;
    }
    /**
   * Gets the index at which the first occurrence of `value` is found in `array`
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons. If `fromIndex` is negative, it's used as the
   * offset from the end of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.indexOf([1, 2, 1, 2], 2);
   * // => 1
   *
   * // Search from the `fromIndex`.
   * _.indexOf([1, 2, 1, 2], 2, 2);
   * // => 3
   */
    function indexOf(array, value, fromIndex) {
        var length = array ? array.length : 0;
        if (typeof fromIndex == "number") {
            fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
        } else {
            fromIndex = 0;
        }
        var index = (fromIndex || 0) - 1, isReflexive = value === value;
        while (++index < length) {
            var other = array[index];
            if (isReflexive ? other === value : other !== other) {
                return index;
            }
        }
        return -1;
    }
    /**
   * Gets the last element of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the last element of `array`.
   * @example
   *
   * _.last([1, 2, 3]);
   * // => 3
   */
    function last(array) {
        var length = array ? array.length : 0;
        return length ? array[length - 1] : undefined;
    }
    /**
   * Creates a slice of `array` from `start` up to, but not including, `end`.
   *
   * **Note:** This method is used instead of
   * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
   * returned.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
    function slice(array, start, end) {
        var length = array ? array.length : 0;
        start = start == null ? 0 : +start;
        end = end === undefined ? length : +end;
        return length ? baseSlice(array, start, end) : [];
    }
    /*------------------------------------------------------------------------*/
    /**
   * Creates a `lodash` wrapper instance that wraps `value` with explicit method
   * chain sequences enabled. The result of such sequences must be unwrapped
   * with `_#value`.
   *
   * @static
   * @memberOf _
   * @since 1.3.0
   * @category Seq
   * @param {*} value The value to wrap.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'age': 36 },
   *   { 'user': 'fred',    'age': 40 },
   *   { 'user': 'pebbles', 'age': 1 }
   * ];
   *
   * var youngest = _
   *   .chain(users)
   *   .sortBy('age')
   *   .map(function(o) {
   *     return o.user + ' is ' + o.age;
   *   })
   *   .head()
   *   .value();
   * // => 'pebbles is 1'
   */
    function chain(value) {
        var result = lodash(value);
        result.__chain__ = true;
        return result;
    }
    /**
   * This method invokes `interceptor` and returns `value`. The interceptor
   * is invoked with one argument; (value). The purpose of this method is to
   * "tap into" a method chain sequence in order to modify intermediate results.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Seq
   * @param {*} value The value to provide to `interceptor`.
   * @param {Function} interceptor The function to invoke.
   * @returns {*} Returns `value`.
   * @example
   *
   * _([1, 2, 3])
   *  .tap(function(array) {
   *    // Mutate input array.
   *    array.pop();
   *  })
   *  .reverse()
   *  .value();
   * // => [2, 1]
   */
    function tap(value, interceptor) {
        interceptor(value);
        return value;
    }
    /**
   * This method is like `_.tap` except that it returns the result of `interceptor`.
   * The purpose of this method is to "pass thru" values replacing intermediate
   * results in a method chain sequence.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Seq
   * @param {*} value The value to provide to `interceptor`.
   * @param {Function} interceptor The function to invoke.
   * @returns {*} Returns the result of `interceptor`.
   * @example
   *
   * _('  abc  ')
   *  .chain()
   *  .trim()
   *  .thru(function(value) {
   *    return [value];
   *  })
   *  .value();
   * // => ['abc']
   */
    function thru(value, interceptor) {
        return interceptor(value);
    }
    /**
   * Creates a `lodash` wrapper instance with explicit method chain sequences enabled.
   *
   * @name chain
   * @memberOf _
   * @since 0.1.0
   * @category Seq
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 }
   * ];
   *
   * // A sequence without explicit chaining.
   * _(users).head();
   * // => { 'user': 'barney', 'age': 36 }
   *
   * // A sequence with explicit chaining.
   * _(users)
   *   .chain()
   *   .head()
   *   .pick('user')
   *   .value();
   * // => { 'user': 'barney' }
   */
    function wrapperChain() {
        return chain(this);
    }
    /**
   * Executes the chain sequence to resolve the unwrapped value.
   *
   * @name value
   * @memberOf _
   * @since 0.1.0
   * @alias toJSON, valueOf
   * @category Seq
   * @returns {*} Returns the resolved unwrapped value.
   * @example
   *
   * _([1, 2, 3]).value();
   * // => [1, 2, 3]
   */
    function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
    }
    /*------------------------------------------------------------------------*/
    /**
   * Checks if `predicate` returns truthy for **all** elements of `collection`.
   * Iteration is stopped once `predicate` returns falsey. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * **Note:** This method returns `true` for
   * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
   * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
   * elements of empty collections.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity]
   *  The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`.
   * @example
   *
   * _.every([true, 1, null, 'yes'], Boolean);
   * // => false
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': false },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.every(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.every(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.every(users, 'active');
   * // => false
   */
    function every(collection, predicate, guard) {
        predicate = guard ? undefined : predicate;
        return baseEvery(collection, baseIteratee(predicate));
    }
    /**
   * Iterates over elements of `collection`, returning an array of all elements
   * `predicate` returns truthy for. The predicate is invoked with three
   * arguments: (value, index|key, collection).
   *
   * **Note:** Unlike `_.remove`, this method returns a new array.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity]
   *  The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   * @see _.reject
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * _.filter(users, function(o) { return !o.active; });
   * // => objects for ['fred']
   *
   * // The `_.matches` iteratee shorthand.
   * _.filter(users, { 'age': 36, 'active': true });
   * // => objects for ['barney']
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.filter(users, ['active', false]);
   * // => objects for ['fred']
   *
   * // The `_.property` iteratee shorthand.
   * _.filter(users, 'active');
   * // => objects for ['barney']
   */
    function filter(collection, predicate) {
        return baseFilter(collection, baseIteratee(predicate));
    }
    /**
   * Iterates over elements of `collection`, returning the first element
   * `predicate` returns truthy for. The predicate is invoked with three
   * arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to inspect.
   * @param {Function} [predicate=_.identity]
   *  The function invoked per iteration.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {*} Returns the matched element, else `undefined`.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'age': 36, 'active': true },
   *   { 'user': 'fred',    'age': 40, 'active': false },
   *   { 'user': 'pebbles', 'age': 1,  'active': true }
   * ];
   *
   * _.find(users, function(o) { return o.age < 40; });
   * // => object for 'barney'
   *
   * // The `_.matches` iteratee shorthand.
   * _.find(users, { 'age': 1, 'active': true });
   * // => object for 'pebbles'
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.find(users, ['active', false]);
   * // => object for 'fred'
   *
   * // The `_.property` iteratee shorthand.
   * _.find(users, 'active');
   * // => object for 'barney'
   */
    var find = createFind(findIndex);
    /**
   * Iterates over elements of `collection` and invokes `iteratee` for each element.
   * The iteratee is invoked with three arguments: (value, index|key, collection).
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * **Note:** As with other "Collections" methods, objects with a "length"
   * property are iterated like arrays. To avoid this behavior use `_.forIn`
   * or `_.forOwn` for object iteration.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias each
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   * @see _.forEachRight
   * @example
   *
   * _.forEach([1, 2], function(value) {
   *   console.log(value);
   * });
   * // => Logs `1` then `2`.
   *
   * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
   *   console.log(key);
   * });
   * // => Logs 'a' then 'b' (iteration order is not guaranteed).
   */
    function forEach(collection, iteratee) {
        return baseEach(collection, baseIteratee(iteratee));
    }
    /**
   * Creates an array of values by running each element in `collection` thru
   * `iteratee`. The iteratee is invoked with three arguments:
   * (value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
   *
   * The guarded methods are:
   * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
   * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
   * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
   * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * _.map([4, 8], square);
   * // => [16, 64]
   *
   * _.map({ 'a': 4, 'b': 8 }, square);
   * // => [16, 64] (iteration order is not guaranteed)
   *
   * var users = [
   *   { 'user': 'barney' },
   *   { 'user': 'fred' }
   * ];
   *
   * // The `_.property` iteratee shorthand.
   * _.map(users, 'user');
   * // => ['barney', 'fred']
   */
    function map(collection, iteratee) {
        return baseMap(collection, baseIteratee(iteratee));
    }
    /**
   * Reduces `collection` to a value which is the accumulated result of running
   * each element in `collection` thru `iteratee`, where each successive
   * invocation is supplied the return value of the previous. If `accumulator`
   * is not given, the first element of `collection` is used as the initial
   * value. The iteratee is invoked with four arguments:
   * (accumulator, value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.reduce`, `_.reduceRight`, and `_.transform`.
   *
   * The guarded methods are:
   * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
   * and `sortBy`
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @returns {*} Returns the accumulated value.
   * @see _.reduceRight
   * @example
   *
   * _.reduce([1, 2], function(sum, n) {
   *   return sum + n;
   * }, 0);
   * // => 3
   *
   * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
   *   (result[value] || (result[value] = [])).push(key);
   *   return result;
   * }, {});
   * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
   */
    function reduce(collection, iteratee, accumulator) {
        return baseReduce(collection, baseIteratee(iteratee), accumulator, arguments.length < 3, baseEach);
    }
    /**
   * Gets the size of `collection` by returning its length for array-like
   * values or the number of own enumerable string keyed properties for objects.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object|string} collection The collection to inspect.
   * @returns {number} Returns the collection size.
   * @example
   *
   * _.size([1, 2, 3]);
   * // => 3
   *
   * _.size({ 'a': 1, 'b': 2 });
   * // => 2
   *
   * _.size('pebbles');
   * // => 7
   */
    function size(collection) {
        if (collection == null) {
            return 0;
        }
        collection = isArrayLike(collection) ? collection : nativeKeys(collection);
        return collection.length;
    }
    /**
   * Checks if `predicate` returns truthy for **any** element of `collection`.
   * Iteration is stopped once `predicate` returns truthy. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   * @example
   *
   * _.some([null, 0, 'yes', false], Boolean);
   * // => true
   *
   * var users = [
   *   { 'user': 'barney', 'active': true },
   *   { 'user': 'fred',   'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.some(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.some(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.some(users, 'active');
   * // => true
   */
    function some(collection, predicate, guard) {
        predicate = guard ? undefined : predicate;
        return baseSome(collection, baseIteratee(predicate));
    }
    /**
   * Creates an array of elements, sorted in ascending order by the results of
   * running each element in a collection thru each iteratee. This method
   * performs a stable sort, that is, it preserves the original sort order of
   * equal elements. The iteratees are invoked with one argument: (value).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {...(Function|Function[])} [iteratees=[_.identity]]
   *  The iteratees to sort by.
   * @returns {Array} Returns the new sorted array.
   * @example
   *
   * var users = [
   *   { 'user': 'fred',   'age': 48 },
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 },
   *   { 'user': 'barney', 'age': 34 }
   * ];
   *
   * _.sortBy(users, [function(o) { return o.user; }]);
   * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
   *
   * _.sortBy(users, ['user', 'age']);
   * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
   */
    function sortBy(collection, iteratee) {
        var index = 0;
        iteratee = baseIteratee(iteratee);
        return baseMap(baseMap(collection, function(value, key, collection) {
            return {
                value: value,
                index: index++,
                criteria: iteratee(value, key, collection)
            };
        }).sort(function(object, other) {
            return compareAscending(object.criteria, other.criteria) || object.index - other.index;
        }), baseProperty("value"));
    }
    /*------------------------------------------------------------------------*/
    /**
   * Creates a function that invokes `func`, with the `this` binding and arguments
   * of the created function, while it's called less than `n` times. Subsequent
   * calls to the created function return the result of the last `func` invocation.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {number} n The number of calls at which `func` is no longer invoked.
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * jQuery(element).on('click', _.before(5, addContactToList));
   * // => Allows adding up to 4 contacts to the list.
   */
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
    /**
   * Creates a function that invokes `func` with the `this` binding of `thisArg`
   * and `partials` prepended to the arguments it receives.
   *
   * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
   * may be used as a placeholder for partially applied arguments.
   *
   * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
   * property of bound functions.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to bind.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {...*} [partials] The arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * function greet(greeting, punctuation) {
   *   return greeting + ' ' + this.user + punctuation;
   * }
   *
   * var object = { 'user': 'fred' };
   *
   * var bound = _.bind(greet, object, 'hi');
   * bound('!');
   * // => 'hi fred!'
   *
   * // Bound with placeholders.
   * var bound = _.bind(greet, object, _, '!');
   * bound('hi');
   * // => 'hi fred!'
   */
    var bind = baseRest(function(func, thisArg, partials) {
        return createPartial(func, BIND_FLAG | PARTIAL_FLAG, thisArg, partials);
    });
    /**
   * Defers invoking the `func` until the current call stack has cleared. Any
   * additional arguments are provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to defer.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.defer(function(text) {
   *   console.log(text);
   * }, 'deferred');
   * // => Logs 'deferred' after one millisecond.
   */
    var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
    });
    /**
   * Invokes `func` after `wait` milliseconds. Any additional arguments are
   * provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to delay.
   * @param {number} wait The number of milliseconds to delay invocation.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.delay(function(text) {
   *   console.log(text);
   * }, 1000, 'later');
   * // => Logs 'later' after one second.
   */
    var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
    });
    /**
   * Creates a function that negates the result of the predicate `func`. The
   * `func` predicate is invoked with the `this` binding and arguments of the
   * created function.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {Function} predicate The predicate to negate.
   * @returns {Function} Returns the new negated function.
   * @example
   *
   * function isEven(n) {
   *   return n % 2 == 0;
   * }
   *
   * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
   * // => [1, 3, 5]
   */
    function negate(predicate) {
        if (typeof predicate != "function") {
            throw new TypeError(FUNC_ERROR_TEXT);
        }
        return function() {
            var args = arguments;
            return !predicate.apply(this, args);
        };
    }
    /**
   * Creates a function that is restricted to invoking `func` once. Repeat calls
   * to the function return the value of the first invocation. The `func` is
   * invoked with the `this` binding and arguments of the created function.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * var initialize = _.once(createApplication);
   * initialize();
   * initialize();
   * // => `createApplication` is invoked once
   */
    function once(func) {
        return before(2, func);
    }
    /*------------------------------------------------------------------------*/
    /**
   * Creates a shallow clone of `value`.
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
   * and supports cloning arrays, array buffers, booleans, date objects, maps,
   * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
   * arrays. The own enumerable properties of `arguments` objects are cloned
   * as plain objects. An empty object is returned for uncloneable values such
   * as error objects, functions, DOM nodes, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to clone.
   * @returns {*} Returns the cloned value.
   * @see _.cloneDeep
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var shallow = _.clone(objects);
   * console.log(shallow[0] === objects[0]);
   * // => true
   */
    function clone(value) {
        if (!isObject(value)) {
            return value;
        }
        return isArray(value) ? copyArray(value) : copyObject(value, nativeKeys(value));
    }
    /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
    function eq(value, other) {
        return value === other || value !== value && other !== other;
    }
    /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
    function isArguments(value) {
        return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
    }
    /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
    var isArray = Array.isArray;
    /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
    function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
    }
    /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object,
   *  else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
    function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
    }
    /**
   * Checks if `value` is classified as a boolean primitive or object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
   * @example
   *
   * _.isBoolean(false);
   * // => true
   *
   * _.isBoolean(null);
   * // => false
   */
    function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && objectToString.call(value) == boolTag;
    }
    /**
   * Checks if `value` is classified as a `Date` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
   * @example
   *
   * _.isDate(new Date);
   * // => true
   *
   * _.isDate('Mon April 23 2012');
   * // => false
   */
    var isDate = baseIsDate;
    /**
   * Checks if `value` is an empty object, collection, map, or set.
   *
   * Objects are considered empty if they have no own enumerable string keyed
   * properties.
   *
   * Array-like values such as `arguments` objects, arrays, buffers, strings, or
   * jQuery-like collections are considered empty if they have a `length` of `0`.
   * Similarly, maps and sets are considered empty if they have a `size` of `0`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is empty, else `false`.
   * @example
   *
   * _.isEmpty(null);
   * // => true
   *
   * _.isEmpty(true);
   * // => true
   *
   * _.isEmpty(1);
   * // => true
   *
   * _.isEmpty([1, 2, 3]);
   * // => false
   *
   * _.isEmpty({ 'a': 1 });
   * // => false
   */
    function isEmpty(value) {
        if (isArrayLike(value) && (isArray(value) || isString(value) || isFunction(value.splice) || isArguments(value))) {
            return !value.length;
        }
        return !nativeKeys(value).length;
    }
    /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent.
   *
   * **Note:** This method supports comparing arrays, array buffers, booleans,
   * date objects, error objects, maps, numbers, `Object` objects, regexes,
   * sets, strings, symbols, and typed arrays. `Object` objects are compared
   * by their own, not inherited, enumerable properties. Functions and DOM
   * nodes are **not** supported.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.isEqual(object, other);
   * // => true
   *
   * object === other;
   * // => false
   */
    function isEqual(value, other) {
        return baseIsEqual(value, other);
    }
    /**
   * Checks if `value` is a finite primitive number.
   *
   * **Note:** This method is based on
   * [`Number.isFinite`](https://mdn.io/Number/isFinite).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
   * @example
   *
   * _.isFinite(3);
   * // => true
   *
   * _.isFinite(Number.MIN_VALUE);
   * // => true
   *
   * _.isFinite(Infinity);
   * // => false
   *
   * _.isFinite('3');
   * // => false
   */
    function isFinite(value) {
        return typeof value == "number" && nativeIsFinite(value);
    }
    /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
    function isFunction(value) {
        var tag = isObject(value) ? objectToString.call(value) : "";
        return tag == funcTag || tag == genTag;
    }
    /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
    function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
    function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
    }
    /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
    function isObjectLike(value) {
        return value != null && typeof value == "object";
    }
    /**
   * Checks if `value` is `NaN`.
   *
   * **Note:** This method is based on
   * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
   * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
   * `undefined` and other non-number values.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   * @example
   *
   * _.isNaN(NaN);
   * // => true
   *
   * _.isNaN(new Number(NaN));
   * // => true
   *
   * isNaN(undefined);
   * // => true
   *
   * _.isNaN(undefined);
   * // => false
   */
    function isNaN(value) {
        return isNumber(value) && value != +value;
    }
    /**
   * Checks if `value` is `null`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
   * @example
   *
   * _.isNull(null);
   * // => true
   *
   * _.isNull(void 0);
   * // => false
   */
    function isNull(value) {
        return value === null;
    }
    /**
   * Checks if `value` is classified as a `Number` primitive or object.
   *
   * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
   * classified as numbers, use the `_.isFinite` method.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a number, else `false`.
   * @example
   *
   * _.isNumber(3);
   * // => true
   *
   * _.isNumber(Number.MIN_VALUE);
   * // => true
   *
   * _.isNumber(Infinity);
   * // => true
   *
   * _.isNumber('3');
   * // => false
   */
    function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
    }
    /**
   * Checks if `value` is classified as a `RegExp` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
   * @example
   *
   * _.isRegExp(/abc/);
   * // => true
   *
   * _.isRegExp('/abc/');
   * // => false
   */
    var isRegExp = baseIsRegExp;
    /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a string, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */
    function isString(value) {
        return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    /**
   * Checks if `value` is `undefined`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
   * @example
   *
   * _.isUndefined(void 0);
   * // => true
   *
   * _.isUndefined(null);
   * // => false
   */
    function isUndefined(value) {
        return value === undefined;
    }
    /**
   * Converts `value` to an array.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {Array} Returns the converted array.
   * @example
   *
   * _.toArray({ 'a': 1, 'b': 2 });
   * // => [1, 2]
   *
   * _.toArray('abc');
   * // => ['a', 'b', 'c']
   *
   * _.toArray(1);
   * // => []
   *
   * _.toArray(null);
   * // => []
   */
    function toArray(value) {
        if (!isArrayLike(value)) {
            return values(value);
        }
        return value.length ? copyArray(value) : [];
    }
    /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */
    var toInteger = Number;
    /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
    var toNumber = Number;
    /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
    function toString(value) {
        if (typeof value == "string") {
            return value;
        }
        return value == null ? "" : value + "";
    }
    /*------------------------------------------------------------------------*/
    /**
   * Assigns own enumerable string keyed properties of source objects to the
   * destination object. Source objects are applied from left to right.
   * Subsequent sources overwrite property assignments of previous sources.
   *
   * **Note:** This method mutates `object` and is loosely based on
   * [`Object.assign`](https://mdn.io/Object/assign).
   *
   * @static
   * @memberOf _
   * @since 0.10.0
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @see _.assignIn
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * function Bar() {
   *   this.c = 3;
   * }
   *
   * Foo.prototype.b = 2;
   * Bar.prototype.d = 4;
   *
   * _.assign({ 'a': 0 }, new Foo, new Bar);
   * // => { 'a': 1, 'c': 3 }
   */
    var assign = createAssigner(function(object, source) {
        copyObject(source, nativeKeys(source), object);
    });
    /**
   * This method is like `_.assign` except that it iterates over own and
   * inherited source properties.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @alias extend
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @see _.assign
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * function Bar() {
   *   this.c = 3;
   * }
   *
   * Foo.prototype.b = 2;
   * Bar.prototype.d = 4;
   *
   * _.assignIn({ 'a': 0 }, new Foo, new Bar);
   * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
   */
    var assignIn = createAssigner(function(object, source) {
        copyObject(source, nativeKeysIn(source), object);
    });
    /**
   * This method is like `_.assignIn` except that it accepts `customizer`
   * which is invoked to produce the assigned values. If `customizer` returns
   * `undefined`, assignment is handled by the method instead. The `customizer`
   * is invoked with five arguments: (objValue, srcValue, key, object, source).
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @alias extendWith
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} sources The source objects.
   * @param {Function} [customizer] The function to customize assigned values.
   * @returns {Object} Returns `object`.
   * @see _.assignWith
   * @example
   *
   * function customizer(objValue, srcValue) {
   *   return _.isUndefined(objValue) ? srcValue : objValue;
   * }
   *
   * var defaults = _.partialRight(_.assignInWith, customizer);
   *
   * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
    var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object, customizer);
    });
    /**
   * Creates an object that inherits from the `prototype` object. If a
   * `properties` object is given, its own enumerable string keyed properties
   * are assigned to the created object.
   *
   * @static
   * @memberOf _
   * @since 2.3.0
   * @category Object
   * @param {Object} prototype The object to inherit from.
   * @param {Object} [properties] The properties to assign to the object.
   * @returns {Object} Returns the new object.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * function Circle() {
   *   Shape.call(this);
   * }
   *
   * Circle.prototype = _.create(Shape.prototype, {
   *   'constructor': Circle
   * });
   *
   * var circle = new Circle;
   * circle instanceof Circle;
   * // => true
   *
   * circle instanceof Shape;
   * // => true
   */
    function create(prototype, properties) {
        var result = baseCreate(prototype);
        return properties ? assign(result, properties) : result;
    }
    /**
   * Assigns own and inherited enumerable string keyed properties of source
   * objects to the destination object for all destination properties that
   * resolve to `undefined`. Source objects are applied from left to right.
   * Once a property is set, additional values of the same property are ignored.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @see _.defaultsDeep
   * @example
   *
   * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
    var defaults = baseRest(function(args) {
        args.push(undefined, assignInDefaults);
        return assignInWith.apply(undefined, args);
    });
    /**
   * Checks if `path` is a direct property of `object`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = { 'a': { 'b': 2 } };
   * var other = _.create({ 'a': _.create({ 'b': 2 }) });
   *
   * _.has(object, 'a');
   * // => true
   *
   * _.has(object, 'a.b');
   * // => true
   *
   * _.has(object, ['a', 'b']);
   * // => true
   *
   * _.has(other, 'a');
   * // => false
   */
    function has(object, path) {
        return object != null && hasOwnProperty.call(object, path);
    }
    /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
    var keys = nativeKeys;
    /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
    var keysIn = nativeKeysIn;
    /**
   * Creates an object composed of the picked `object` properties.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The source object.
   * @param {...(string|string[])} [props] The property identifiers to pick.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pick(object, ['a', 'c']);
   * // => { 'a': 1, 'c': 3 }
   */
    var pick = flatRest(function(object, props) {
        return object == null ? {} : basePick(object, baseMap(props, toKey));
    });
    /**
   * This method is like `_.get` except that if the resolved value is a
   * function it's invoked with the `this` binding of its parent object and
   * its result is returned.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to resolve.
   * @param {*} [defaultValue] The value returned for `undefined` resolved values.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
   *
   * _.result(object, 'a[0].b.c1');
   * // => 3
   *
   * _.result(object, 'a[0].b.c2');
   * // => 4
   *
   * _.result(object, 'a[0].b.c3', 'default');
   * // => 'default'
   *
   * _.result(object, 'a[0].b.c3', _.constant('default'));
   * // => 'default'
   */
    function result(object, path, defaultValue) {
        var value = object == null ? undefined : object[path];
        if (value === undefined) {
            value = defaultValue;
        }
        return isFunction(value) ? value.call(object) : value;
    }
    /**
   * Creates an array of the own enumerable string keyed property values of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property values.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.values(new Foo);
   * // => [1, 2] (iteration order is not guaranteed)
   *
   * _.values('hi');
   * // => ['h', 'i']
   */
    function values(object) {
        return object ? baseValues(object, keys(object)) : [];
    }
    /*------------------------------------------------------------------------*/
    /**
   * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
   * corresponding HTML entities.
   *
   * **Note:** No other characters are escaped. To escape additional
   * characters use a third-party library like [_he_](https://mths.be/he).
   *
   * Though the ">" character is escaped for symmetry, characters like
   * ">" and "/" don't need escaping in HTML and have no special meaning
   * unless they're part of a tag or unquoted attribute value. See
   * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
   * (under "semi-related fun fact") for more details.
   *
   * When working with HTML you should always
   * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
   * XSS vectors.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('fred, barney, & pebbles');
   * // => 'fred, barney, &amp; pebbles'
   */
    function escape(string) {
        string = toString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
    }
    /*------------------------------------------------------------------------*/
    /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
    function identity(value) {
        return value;
    }
    /**
   * Creates a function that invokes `func` with the arguments of the created
   * function. If `func` is a property name, the created function returns the
   * property value for a given element. If `func` is an array or object, the
   * created function returns `true` for elements that contain the equivalent
   * source properties, otherwise it returns `false`.
   *
   * @static
   * @since 4.0.0
   * @memberOf _
   * @category Util
   * @param {*} [func=_.identity] The value to convert to a callback.
   * @returns {Function} Returns the callback.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
   * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.filter(users, _.iteratee(['user', 'fred']));
   * // => [{ 'user': 'fred', 'age': 40 }]
   *
   * // The `_.property` iteratee shorthand.
   * _.map(users, _.iteratee('user'));
   * // => ['barney', 'fred']
   *
   * // Create custom iteratee shorthands.
   * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
   *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
   *     return func.test(string);
   *   };
   * });
   *
   * _.filter(['abc', 'def'], /ef/);
   * // => ['def']
   */
    var iteratee = baseIteratee;
    /**
   * Creates a function that performs a partial deep comparison between a given
   * object and `source`, returning `true` if the given object has equivalent
   * property values, else `false`.
   *
   * **Note:** The created function is equivalent to `_.isMatch` with `source`
   * partially applied.
   *
   * Partial comparisons will match empty array and empty object `source`
   * values against any array or object value, respectively. See `_.isEqual`
   * for a list of supported value comparisons.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Util
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   * @example
   *
   * var objects = [
   *   { 'a': 1, 'b': 2, 'c': 3 },
   *   { 'a': 4, 'b': 5, 'c': 6 }
   * ];
   *
   * _.filter(objects, _.matches({ 'a': 4, 'c': 6 }));
   * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
   */
    function matches(source) {
        return baseMatches(assign({}, source));
    }
    /**
   * Adds all own enumerable string keyed function properties of a source
   * object to the destination object. If `object` is a function, then methods
   * are added to its prototype as well.
   *
   * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
   * avoid conflicts caused by modifying the original.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {Function|Object} [object=lodash] The destination object.
   * @param {Object} source The object of functions to add.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
   * @returns {Function|Object} Returns `object`.
   * @example
   *
   * function vowels(string) {
   *   return _.filter(string, function(v) {
   *     return /[aeiou]/i.test(v);
   *   });
   * }
   *
   * _.mixin({ 'vowels': vowels });
   * _.vowels('fred');
   * // => ['e']
   *
   * _('fred').vowels().value();
   * // => ['e']
   *
   * _.mixin({ 'vowels': vowels }, { 'chain': false });
   * _('fred').vowels();
   * // => ['e']
   */
    function mixin(object, source, options) {
        var props = keys(source), methodNames = baseFunctions(source, props);
        if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
            options = source;
            source = object;
            object = this;
            methodNames = baseFunctions(source, keys(source));
        }
        var chain = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
        baseEach(methodNames, function(methodName) {
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
    /**
   * Reverts the `_` variable to its previous value and returns a reference to
   * the `lodash` function.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @returns {Function} Returns the `lodash` function.
   * @example
   *
   * var lodash = _.noConflict();
   */
    function noConflict() {
        if (root._ === this) {
            root._ = oldDash;
        }
        return this;
    }
    /**
   * This method returns `undefined`.
   *
   * @static
   * @memberOf _
   * @since 2.3.0
   * @category Util
   * @example
   *
   * _.times(2, _.noop);
   * // => [undefined, undefined]
   */
    function noop() {}
    /**
   * Generates a unique ID. If `prefix` is given, the ID is appended to it.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {string} [prefix=''] The value to prefix the ID with.
   * @returns {string} Returns the unique ID.
   * @example
   *
   * _.uniqueId('contact_');
   * // => 'contact_104'
   *
   * _.uniqueId();
   * // => '105'
   */
    function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
    }
    /*------------------------------------------------------------------------*/
    /**
   * Computes the maximum value of `array`. If `array` is empty or falsey,
   * `undefined` is returned.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Math
   * @param {Array} array The array to iterate over.
   * @returns {*} Returns the maximum value.
   * @example
   *
   * _.max([4, 2, 8, 6]);
   * // => 8
   *
   * _.max([]);
   * // => undefined
   */
    function max(array) {
        return array && array.length ? baseExtremum(array, identity, baseGt) : undefined;
    }
    /**
   * Computes the minimum value of `array`. If `array` is empty or falsey,
   * `undefined` is returned.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Math
   * @param {Array} array The array to iterate over.
   * @returns {*} Returns the minimum value.
   * @example
   *
   * _.min([4, 2, 8, 6]);
   * // => 2
   *
   * _.min([]);
   * // => undefined
   */
    function min(array) {
        return array && array.length ? baseExtremum(array, identity, baseLt) : undefined;
    }
    /*------------------------------------------------------------------------*/
    lodash.assignIn = assignIn;
    lodash.before = before;
    lodash.bind = bind;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.concat = concat;
    lodash.create = create;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.flattenDeep = flattenDeep;
    lodash.iteratee = iteratee;
    lodash.keys = keys;
    lodash.map = map;
    lodash.matches = matches;
    lodash.mixin = mixin;
    lodash.negate = negate;
    lodash.once = once;
    lodash.pick = pick;
    lodash.slice = slice;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.thru = thru;
    lodash.toArray = toArray;
    lodash.values = values;
    lodash.extend = assignIn;
    mixin(lodash, lodash);
    /*------------------------------------------------------------------------*/
    lodash.clone = clone;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.forEach = forEach;
    lodash.has = has;
    lodash.head = head;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.last = last;
    lodash.max = max;
    lodash.min = min;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.reduce = reduce;
    lodash.result = result;
    lodash.size = size;
    lodash.some = some;
    lodash.uniqueId = uniqueId;
    lodash.each = forEach;
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
    /*------------------------------------------------------------------------*/
    /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type {string}
   */
    lodash.VERSION = VERSION;
    baseEach([ "pop", "join", "replace", "reverse", "split", "push", "shift", "sort", "splice", "unshift" ], function(methodName) {
        var func = (/^(?:replace|split)$/.test(methodName) ? String.prototype : arrayProto)[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|join|replace|shift)$/.test(methodName);
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
    lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
    /*--------------------------------------------------------------------------*/
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        root._ = lodash;
        define(function() {
            return lodash;
        });
    } else if (freeModule) {
        (freeModule.exports = lodash)._ = lodash;
        freeExports._ = lodash;
    } else {
        root._ = lodash;
    }
}).call(this);

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
window.console = window.console || {};

window.console.log = window.console.log || function() {};

function extend(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
    return subClass;
}

function propCopy(from, to) {
    for (var prop in from) {
        if (from.hasOwnProperty(prop)) {
            if ("object" === typeof from[prop] && "object" === typeof to[prop]) {
                to[prop] = propCopy(from[prop], to[prop]);
            } else {
                to[prop] = from[prop];
            }
        }
    }
    return to;
}

function NOOP() {}

function isValidUrl(url) {
    if (!url) return false;
    var doc, base, anchor, isValid = false;
    try {
        doc = document.implementation.createHTMLDocument("");
        base = doc.createElement("base");
        base.href = base || window.lo;
        doc.head.appendChild(base);
        anchor = doc.createElement("a");
        anchor.href = url;
        doc.body.appendChild(anchor);
        isValid = !(anchor.href === "");
    } catch (e) {
        console.error(e);
    } finally {
        doc.head.removeChild(base);
        doc.body.removeChild(anchor);
        base = null;
        anchor = null;
        doc = null;
        return isValid;
    }
}

/*
 * Tests if the string is a uuid
 *
 * @public
 * @method isUUID
 * @param {string} uuid The string to test
 * @returns {Boolean} true if string is uuid
 */
var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isUUID(uuid) {
    return !uuid ? false : uuidValueRegex.test(uuid);
}

/*
 *  method to encode the query string parameters
 *
 *  @method encodeParams
 *  @public
 *  @params {object} params - an object of name value pairs that will be urlencoded
 *  @return {string} Returns the encoded string
 */
function encodeParams(params) {
    var queryString;
    if (params && Object.keys(params)) {
        queryString = [].slice.call(arguments).reduce(function(a, b) {
            return a.concat(b instanceof Array ? b : [ b ]);
        }, []).filter(function(c) {
            return "object" === typeof c;
        }).reduce(function(p, c) {
            !(c instanceof Array) ? p = p.concat(Object.keys(c).map(function(key) {
                return [ key, c[key] ];
            })) : p.push(c);
            return p;
        }, []).reduce(function(p, c) {
            c.length === 2 ? p.push(c) : p = p.concat(c);
            return p;
        }, []).reduce(function(p, c) {
            c[1] instanceof Array ? c[1].forEach(function(v) {
                p.push([ c[0], v ]);
            }) : p.push(c);
            return p;
        }, []).map(function(c) {
            c[1] = encodeURIComponent(c[1]);
            return c.join("=");
        }).join("&");
    }
    return queryString;
}

/*
 *  method to determine whether or not the passed variable is a function
 *
 *  @method isFunction
 *  @public
 *  @params {any} f - any variable
 *  @return {boolean} Returns true or false
 */
function isFunction(f) {
    return f && f !== null && typeof f === "function";
}

/*
 *  a safe wrapper for executing a callback
 *
 *  @method doCallback
 *  @public
 *  @params {Function} callback - the passed-in callback method
 *  @params {Array} params - an array of arguments to pass to the callback
 *  @params {Object} context - an optional calling context for the callback
 *  @return Returns whatever would be returned by the callback. or false.
 */
function doCallback(callback, params, context) {
    var returnValue;
    if (isFunction(callback)) {
        if (!params) params = [];
        if (!context) context = this;
        params.push(context);
        returnValue = callback.apply(context, params);
    }
    return returnValue;
}

(function(global) {
    var name = "Usergrid", overwrittenName = global[name];
    var VALID_REQUEST_METHODS = [ "GET", "POST", "PUT", "DELETE" ];
    function Usergrid() {
        this.logger = new Logger(name);
    }
    Usergrid.isValidEndpoint = function(endpoint) {
        return true;
    };
    Usergrid.Request = function(method, endpoint, query_params, data, callback) {
        var p = new Promise();
        /*
         Create a logger
         */
        this.logger = new global.Logger("Usergrid.Request");
        this.logger.time("process request " + method + " " + endpoint);
        /*
         Validate our input
         */
        this.endpoint = endpoint + "?" + encodeParams(query_params);
        this.method = method.toUpperCase();
        this.data = "object" === typeof data ? JSON.stringify(data) : data;
        if (VALID_REQUEST_METHODS.indexOf(this.method) === -1) {
            throw new UsergridInvalidHTTPMethodError("invalid request method '" + this.method + "'");
        }
        /*
         Prepare our request
         */
        if (!isValidUrl(this.endpoint)) {
            this.logger.error(endpoint, this.endpoint, /^https:\/\//.test(endpoint));
            throw new UsergridInvalidURIError("The provided endpoint is not valid: " + this.endpoint);
        }
        /* a callback to make the request */
        var request = function() {
            return Ajax.request(this.method, this.endpoint, this.data);
        }.bind(this);
        /* a callback to process the response */
        var response = function(err, request) {
            return new Usergrid.Response(err, request);
        }.bind(this);
        /* a callback to clean up and return data to the client */
        var oncomplete = function(err, response) {
            p.done(err, response);
            this.logger.info("REQUEST", err, response);
            doCallback(callback, [ err, response ]);
            this.logger.timeEnd("process request " + method + " " + endpoint);
        }.bind(this);
        /* and a promise to chain them all together */
        Promise.chain([ request, response ]).then(oncomplete);
        return p;
    };
    Usergrid.Response = function(err, response) {
        var p = new Promise();
        var data = null;
        try {
            data = JSON.parse(response.responseText);
        } catch (e) {
            data = {};
        }
        Object.keys(data).forEach(function(key) {
            Object.defineProperty(this, key, {
                value: data[key],
                enumerable: true
            });
        }.bind(this));
        Object.defineProperty(this, "logger", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: new global.Logger(name)
        });
        Object.defineProperty(this, "success", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "err", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: err
        });
        Object.defineProperty(this, "status", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: parseInt(response.status)
        });
        Object.defineProperty(this, "statusGroup", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: this.status - this.status % 100
        });
        switch (this.statusGroup) {
          case 200:
            this.success = true;
            break;

          case 400:
          case 500:
          case 300:
          case 100:
          default:
            this.success = false;
            break;
        }
        if (this.success) {
            p.done(null, this);
        } else {
            p.done(UsergridError.fromResponse(data), this);
        }
        return p;
    };
    Usergrid.Response.prototype.getEntities = function() {
        var entities;
        if (this.success) {
            entities = this.data ? this.data.entities : this.entities;
        }
        return entities || [];
    };
    Usergrid.Response.prototype.getEntity = function() {
        var entities = this.getEntities();
        return entities[0];
    };
    Usergrid.VERSION = Usergrid.USERGRID_SDK_VERSION = "0.11.0";
    global[name] = Usergrid;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Usergrid;
    };
    return global[name];
})(this);

(function() {
    var name = "Client", global = this, overwrittenName = global[name], exports;
    var AUTH_ERRORS = [ "auth_expired_session_token", "auth_missing_credentials", "auth_unverified_oath", "expired_token", "unauthorized", "auth_invalid" ];
    var defaultOptions = {
        baseUrl: "https://api.usergrid.com"
    };
    Usergrid.Client = function(options) {
        if (!options.orgId || !options.appId) {
            throw new Error('"orgId" and "appId" parameters are required when instantiating UsergridClient');
        }
        _.defaults(this, options, defaultOptions);
        this.clientAppURL = [ this.baseUrl, this.orgId, this.appId ].join("/");
        this.isSharedInstance = false;
        this.currentUser = undefined;
        this.appAuth = undefined;
        this.userAuth = undefined;
        this.authMode = undefined;
        if (options.qs) {
            this.setObject("default_qs", options.qs);
        }
        this.buildCurl = options.buildCurl || false;
        this.logging = options.logging || false;
    };
    /*
   *  Main function for making requests to the API.  Can be called directly.
   *
   *  options object:
   *  `method` - http method (GET, POST, PUT, or DELETE), defaults to GET
   *  `qs` - object containing querystring values to be appended to the uri
   *  `body` - object containing entity body for POST and PUT requests
   *  `endpoint` - API endpoint, for example 'users/fred'
   *  `mQuery` - boolean, set to true if running management query, defaults to false
   *
   *  @method request
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.request = function(options, callback) {
        var method = options.method || "GET";
        var endpoint = options.endpoint;
        var body = options.body || {};
        var qs = options.qs || {};
        var mQuery = options.mQuery || false;
        var orgId = this.get("orgId");
        var appId = this.get("appId");
        var default_qs = this.getObject("default_qs");
        var uri;
        /*var logoutCallback=function(){
        if (typeof(this.logoutCallback) === 'function') {
            return this.logoutCallback(true, 'no_org_or_app_name_specified');
        }
    }.bind(this);*/
        if (!mQuery && !orgId && !appId) {
            return logoutCallback();
        }
        if (mQuery) {
            uri = this.baseUrl + "/" + endpoint;
        } else {
            uri = this.baseUrl + "/" + orgId + "/" + appId + "/" + endpoint;
        }
        if (this.getToken()) {
            qs.access_token = this.getToken();
        }
        if (default_qs) {
            qs = propCopy(qs, default_qs);
        }
        var self = this;
        var req = new Usergrid.Request(method, uri, qs, body, function(err, response) {
            /*if (AUTH_ERRORS.indexOf(response.error) !== -1) {
            return logoutCallback();
        }*/
            if (err) {
                doCallback(callback, [ err, response, self ], self);
            } else {
                doCallback(callback, [ null, response, self ], self);
            }
        });
    };
    /*
   *  function for building asset urls
   *
   *  @method buildAssetURL
   *  @public
   *  @params {string} uuid
   *  @return {string} assetURL
   */
    Usergrid.Client.prototype.buildAssetURL = function(uuid) {
        var self = this;
        var qs = {};
        var assetURL = this.baseUrl + "/" + this.orgId + "/" + this.appId + "/assets/" + uuid + "/data";
        if (self.getToken()) {
            qs.access_token = self.getToken();
        }
        var encoded_params = encodeParams(qs);
        if (encoded_params) {
            assetURL += "?" + encoded_params;
        }
        return assetURL;
    };
    /*
   *  Main function for creating new groups. Call this directly.
   *
   *  @method createGroup
   *  @public
   *  @params {string} path
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.createGroup = function(options, callback) {
        var group = new Usergrid.Group({
            path: options.path,
            client: this,
            data: options
        });
        group.save(function(err, response) {
            doCallback(callback, [ err, response, group ], group);
        });
    };
    /*
   *  Main function for creating new entities - should be called directly.
   *
   *  options object: options {data:{'type':'collection_type', 'key':'value'}, uuid:uuid}}
   *
   *  @method createEntity
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.createEntity = function(options, callback) {
        var entity = new Usergrid.Entity({
            client: this,
            data: options
        });
        entity.save(function(err, response) {
            doCallback(callback, [ err, response, entity ], entity);
        });
    };
    /*
   *  Main function for getting existing entities - should be called directly.
   *
   *  You must supply a uuid or (username or name). Username only applies to users.
   *  Name applies to all custom entities
   *
   *  options object: options {data:{'type':'collection_type', 'name':'value', 'username':'value'}, uuid:uuid}}
   *
   *  @method createEntity
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.getEntity = function(options, callback) {
        var entity = new Usergrid.Entity({
            client: this,
            data: options
        });
        entity.fetch(function(err, response) {
            doCallback(callback, [ err, response, entity ], entity);
        });
    };
    /*
   *  Main function for restoring an entity from serialized data.
   *
   *  serializedObject should have come from entityObject.serialize();
   *
   *  @method restoreEntity
   *  @public
   *  @param {string} serializedObject
   *  @return {object} Entity Object
   */
    Usergrid.Client.prototype.restoreEntity = function(serializedObject) {
        var data = JSON.parse(serializedObject);
        var options = {
            client: this,
            data: data
        };
        var entity = new Usergrid.Entity(options);
        return entity;
    };
    /*
   *  Main function for creating new counters - should be called directly.
   *
   *  options object: options {timestamp:0, category:'value', counters:{name : value}}
   *
   *  @method createCounter
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, response, counter)
   */
    Usergrid.Client.prototype.createCounter = function(options, callback) {
        var counter = new Usergrid.Counter({
            client: this,
            data: options
        });
        counter.save(callback);
    };
    /*
   *  Main function for creating new assets - should be called directly.
   *
   *  options object: options {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000", file: FileOrBlobObject }
   *
   *  @method createCounter
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, response, counter)
   */
    Usergrid.Client.prototype.createAsset = function(options, callback) {
        var file = options.file;
        if (file) {
            options.name = options.name || file.name;
            options["content-type"] = options["content-type"] || file.type;
            options.path = options.path || "/";
            delete options.file;
        }
        var asset = new Usergrid.Asset({
            client: this,
            data: options
        });
        asset.save(function(err, response, asset) {
            if (file && !err) {
                asset.upload(file, callback);
            } else {
                doCallback(callback, [ err, response, asset ], asset);
            }
        });
    };
    /*
   *  Main function for creating new collections - should be called directly.
   *
   *  options object: options {client:client, type: type, qs:qs}
   *
   *  @method createCollection
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.createCollection = function(options, callback) {
        options.client = this;
        return new Usergrid.Collection(options, function(err, data, collection) {
            console.log("createCollection", arguments);
            doCallback(callback, [ err, collection, data ]);
        });
    };
    /*
   *  Main function for restoring a collection from serialized data.
   *
   *  serializedObject should have come from collectionObject.serialize();
   *
   *  @method restoreCollection
   *  @public
   *  @param {string} serializedObject
   *  @return {object} Collection Object
   */
    Usergrid.Client.prototype.restoreCollection = function(serializedObject) {
        var data = JSON.parse(serializedObject);
        data.client = this;
        var collection = new Usergrid.Collection(data);
        return collection;
    };
    /*
   *  Main function for retrieving a user's activity feed.
   *
   *  @method getFeedForUser
   *  @public
   *  @params {string} username
   *  @param {function} callback
   *  @return {callback} callback(err, data, activities)
   */
    Usergrid.Client.prototype.getFeedForUser = function(username, callback) {
        var options = {
            method: "GET",
            endpoint: "users/" + username + "/feed"
        };
        this.request(options, function(err, data) {
            if (err) {
                doCallback(callback, [ err ]);
            } else {
                doCallback(callback, [ err, data, data.getEntities() ]);
            }
        });
    };
    /*
   *  Function for creating new activities for the current user - should be called directly.
   *
   *  //user can be any of the following: "me", a uuid, a username
   *  Note: the "me" alias will reference the currently logged in user (e.g. 'users/me/activties')
   *
   *  //build a json object that looks like this:
   *  var options =
   *  {
   *    "actor" : {
   *      "displayName" :"myusername",
   *      "uuid" : "myuserid",
   *      "username" : "myusername",
   *      "email" : "myemail",
   *      "picture": "http://path/to/picture",
   *      "image" : {
   *          "duration" : 0,
   *          "height" : 80,
   *          "url" : "http://www.gravatar.com/avatar/",
   *          "width" : 80
   *      },
   *    },
   *    "verb" : "post",
   *    "content" : "My cool message",
   *    "lat" : 48.856614,
   *    "lon" : 2.352222
   *  }
   *
   *  @method createEntity
   *  @public
   *  @params {string} user // "me", a uuid, or a username
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.createUserActivity = function(user, options, callback) {
        options.type = "users/" + user + "/activities";
        options = {
            client: this,
            data: options
        };
        var entity = new Usergrid.Entity(options);
        entity.save(function(err, data) {
            doCallback(callback, [ err, data, entity ]);
        });
    };
    /*
   *  Function for creating user activities with an associated user entity.
   *
   *  user object:
   *  The user object passed into this function is an instance of Usergrid.Entity.
   *
   *  @method createUserActivityWithEntity
   *  @public
   *  @params {object} user
   *  @params {string} content
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.createUserActivityWithEntity = function(user, content, callback) {
        var username = user.get("username");
        var options = {
            actor: {
                displayName: username,
                uuid: user.get("uuid"),
                username: username,
                email: user.get("email"),
                picture: user.get("picture"),
                image: {
                    duration: 0,
                    height: 80,
                    url: user.get("picture"),
                    width: 80
                }
            },
            verb: "post",
            content: content
        };
        this.createUserActivity(username, options, callback);
    };
    /*
   *  A private method to get call timing of last call
   */
    Usergrid.Client.prototype.calcTimeDiff = function() {
        var seconds = 0;
        var time = this._end - this._start;
        try {
            seconds = (time / 10 / 60).toFixed(2);
        } catch (e) {
            return 0;
        }
        return seconds;
    };
    /*
   *  A public method to store the OAuth token for later use - uses localstorage if available
   *
   *  @method setToken
   *  @public
   *  @params {string} token
   *  @return none
   */
    Usergrid.Client.prototype.setToken = function(token) {
        this.set("token", token);
    };
    /*
   *  A public method to get the OAuth token
   *
   *  @method getToken
   *  @public
   *  @return {string} token
   */
    Usergrid.Client.prototype.getToken = function() {
        return this.get("token");
    };
    Usergrid.Client.prototype.setObject = function(key, value) {
        if (value) {
            value = JSON.stringify(value);
        }
        this.set(key, value);
    };
    Usergrid.Client.prototype.set = function(key, value) {
        var keyStore = "apigee_" + key;
        this[key] = value;
        if (typeof Storage !== "undefined") {
            if (value) {
                localStorage.setItem(keyStore, value);
            } else {
                localStorage.removeItem(keyStore);
            }
        }
    };
    Usergrid.Client.prototype.getObject = function(key) {
        return JSON.parse(this.get(key));
    };
    Usergrid.Client.prototype.get = function(key) {
        var keyStore = "apigee_" + key;
        var value = null;
        if (this[key]) {
            value = this[key];
        } else if (typeof Storage !== "undefined") {
            value = localStorage.getItem(keyStore);
        }
        return value;
    };
    /*
   * A public facing helper method for signing up users
   *
   * @method signup
   * @public
   * @params {string} username
   * @params {string} password
   * @params {string} email
   * @params {string} name
   * @param {function} callback
   * @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.signup = function(username, password, email, name, callback) {
        var self = this;
        var options = {
            type: "users",
            username: username,
            password: password,
            email: email,
            name: name
        };
        this.createEntity(options, callback);
    };
    /*
   *
   *  A public method to log in an app user - stores the token for later use
   *
   *  @method login
   *  @public
   *  @params {string} username
   *  @params {string} password
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.login = function(username, password, callback) {
        var self = this;
        var options = {
            method: "POST",
            endpoint: "token",
            body: {
                username: username,
                password: password,
                grant_type: "password"
            }
        };
        self.request(options, function(err, response) {
            var user = {};
            if (err) {
                if (self.logging) console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: response.user
                };
                user = new Usergrid.Entity(options);
                self.setToken(response.access_token);
            }
            doCallback(callback, [ err, response, user ]);
        });
    };
    Usergrid.Client.prototype.adminlogin = function(username, password, callback) {
        var self = this;
        var options = {
            method: "POST",
            endpoint: "management/token",
            body: {
                username: username,
                password: password,
                grant_type: "password"
            },
            mQuery: true
        };
        self.request(options, function(err, response) {
            var user = {};
            if (err) {
                if (self.logging) console.log("error trying to log adminuser in");
            } else {
                var options = {
                    client: self,
                    data: response.user
                };
                user = new Usergrid.Entity(options);
                self.setToken(response.access_token);
            }
            doCallback(callback, [ err, response, user ]);
        });
    };
    Usergrid.Client.prototype.reAuthenticateLite = function(callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "management/me",
            mQuery: true
        };
        this.request(options, function(err, response) {
            if (err && self.logging) {
                console.log("error trying to re-authenticate user");
            } else {
                self.setToken(response.data.access_token);
            }
            doCallback(callback, [ err ]);
        });
    };
    Usergrid.Client.prototype.reAuthenticate = function(email, callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "management/users/" + email,
            mQuery: true
        };
        this.request(options, function(err, response) {
            var organizations = {};
            var applications = {};
            var user = {};
            var data;
            if (err && self.logging) {
                console.log("error trying to full authenticate user");
            } else {
                data = response.data;
                self.setToken(data.token);
                self.set("email", data.email);
                localStorage.setItem("accessToken", data.token);
                localStorage.setItem("userUUID", data.uuid);
                localStorage.setItem("userEmail", data.email);
                var userData = {
                    username: data.username,
                    email: data.email,
                    name: data.name,
                    uuid: data.uuid
                };
                var options = {
                    client: self,
                    data: userData
                };
                user = new Usergrid.Entity(options);
                organizations = data.organizations;
                var org = "";
                try {
                    var existingOrg = self.get("orgName");
                    org = organizations[existingOrg] ? organizations[existingOrg] : organizations[Object.keys(organizations)[0]];
                    self.set("orgName", org.name);
                } catch (e) {
                    err = true;
                    if (self.logging) {
                        console.log("error selecting org");
                    }
                }
                applications = self.parseApplicationsArray(org);
                self.selectFirstApp(applications);
                self.setObject("organizations", organizations);
                self.setObject("applications", applications);
            }
            doCallback(callback, [ err, data, user, organizations, applications ], self);
        });
    };
    /*
   *  A public method to log in an app user with facebook - stores the token for later use
   *
   *  @method loginFacebook
   *  @public
   *  @params {string} username
   *  @params {string} password
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.loginFacebook = function(facebookToken, callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "auth/facebook",
            qs: {
                fb_access_token: facebookToken
            }
        };
        this.request(options, function(err, data) {
            var user = {};
            if (err && self.logging) {
                console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: data.user
                };
                user = new Usergrid.Entity(options);
                self.setToken(data.access_token);
            }
            doCallback(callback, [ err, data, user ], self);
        });
    };
    /*
   *  A public method to get the currently logged in user entity
   *
   *  @method getLoggedInUser
   *  @public
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Usergrid.Client.prototype.getLoggedInUser = function(callback) {
        var self = this;
        if (!this.getToken()) {
            doCallback(callback, [ new UsergridError("Access Token not set"), null, self ], self);
        } else {
            var options = {
                method: "GET",
                endpoint: "users/me"
            };
            this.request(options, function(err, response) {
                if (err) {
                    if (self.logging) {
                        console.log("error trying to log user in");
                    }
                    console.error(err, response);
                    doCallback(callback, [ err, response, self ], self);
                } else {
                    var options = {
                        client: self,
                        data: response.getEntity()
                    };
                    var user = new Usergrid.Entity(options);
                    doCallback(callback, [ null, response, user ], self);
                }
            });
        }
    };
    /*
   *  A public method to test if a user is logged in - does not guarantee that the token is still valid,
   *  but rather that one exists
   *
   *  @method isLoggedIn
   *  @public
   *  @return {boolean} Returns true the user is logged in (has token and uuid), false if not
   */
    Usergrid.Client.prototype.isLoggedIn = function() {
        var token = this.getToken();
        return "undefined" !== typeof token && token !== null;
    };
    /*
   *  A public method to log out an app user - clears all user fields from client
   *
   *  @method logout
   *  @public
   *  @return none
   */
    Usergrid.Client.prototype.logout = function() {
        this.setToken();
    };
    /*
   *  A public method to destroy access tokens on the server
   *
   *  @method logout
   *  @public
   *  @param {string} username	the user associated with the token to revoke
   *  @param {string} token set to 'null' to revoke the token of the currently logged in user
   *    or set to token value to revoke a specific token
   *  @param {string} revokeAll set to 'true' to revoke all tokens for the user
   *  @return none
   */
    Usergrid.Client.prototype.destroyToken = function(username, token, revokeAll, callback) {
        var options = {
            client: self,
            method: "PUT"
        };
        if (revokeAll === true) {
            options.endpoint = "users/" + username + "/revoketokens";
        } else if (token === null) {
            options.endpoint = "users/" + username + "/revoketoken?token=" + this.getToken();
        } else {
            options.endpoint = "users/" + username + "/revoketoken?token=" + token;
        }
        this.request(options, function(err, data) {
            if (err) {
                if (self.logging) {
                    console.log("error destroying access token");
                }
                doCallback(callback, [ err, data, null ], self);
            } else {
                if (revokeAll === true) {
                    console.log("all user tokens invalidated");
                } else {
                    console.log("token invalidated");
                }
                doCallback(callback, [ err, data, null ], self);
            }
        });
    };
    /*
   *  A public method to log out an app user - clears all user fields from client
   *  and destroys the access token on the server.
   *
   *  @method logout
   *  @public
   *  @param {string} username the user associated with the token to revoke
   *  @param {string} token set to 'null' to revoke the token of the currently logged in user
   *   or set to token value to revoke a specific token
   *  @param {string} revokeAll set to 'true' to revoke all tokens for the user
   *  @return none
   */
    Usergrid.Client.prototype.logoutAndDestroyToken = function(username, token, revokeAll, callback) {
        if (username === null) {
            console.log("username required to revoke tokens");
        } else {
            this.destroyToken(username, token, revokeAll, callback);
            if (revokeAll === true || token === this.getToken() || token === null) {
                this.setToken(null);
            }
        }
    };
    /*
   *  A private method to build the curl call to display on the command line
   *
   *  @method buildCurlCall
   *  @private
   *  @param {object} options
   *  @return {string} curl
   */
    Usergrid.Client.prototype.buildCurlCall = function(options) {
        var curl = [ "curl" ];
        var method = (options.method || "GET").toUpperCase();
        var body = options.body;
        var uri = options.uri;
        curl.push("-X");
        curl.push([ "POST", "PUT", "DELETE" ].indexOf(method) >= 0 ? method : "GET");
        curl.push(uri);
        if ("object" === typeof body && Object.keys(body).length > 0 && [ "POST", "PUT" ].indexOf(method) !== -1) {
            curl.push("-d");
            curl.push("'" + JSON.stringify(body) + "'");
        }
        curl = curl.join(" ");
        console.log(curl);
        return curl;
    };
    Usergrid.Client.prototype.getDisplayImage = function(email, picture, size) {
        size = size || 50;
        var image = "https://apigee.com/usergrid/images/user_profile.png";
        try {
            if (picture) {
                image = picture;
            } else if (email.length) {
                image = "https://secure.gravatar.com/avatar/" + MD5(email) + "?s=" + size + encodeURI("&d=https://apigee.com/usergrid/images/user_profile.png");
            }
        } catch (e) {} finally {
            return image;
        }
    };
    global[name] = Usergrid.Client;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return exports;
    };
    return global[name];
})();

var ENTITY_SYSTEM_PROPERTIES = [ "metadata", "created", "modified", "oldpassword", "newpassword", "type", "activated", "uuid" ];

/*
 *  A class to Model a Usergrid Entity.
 *  Set the type and uuid of entity in the 'data' json object
 *
 *  @constructor
 *  @param {object} options {client:client, data:{'type':'collection_type', uuid:'uuid', 'key':'value'}}
 */
Usergrid.Entity = function(options) {
    this._data = {};
    this._client = undefined;
    if (options) {
        this.set(options.data || {});
        this._client = options.client || {};
    }
};

/*
 *  method to determine whether or not the passed variable is a Usergrid Entity
 *
 *  @method isEntity
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
Usergrid.Entity.isEntity = function(obj) {
    return obj && obj instanceof Usergrid.Entity;
};

/*
 *  method to determine whether or not the passed variable is a Usergrid Entity
 *  That has been saved.
 *
 *  @method isPersistedEntity
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
Usergrid.Entity.isPersistedEntity = function(obj) {
    return isEntity(obj) && isUUID(obj.get("uuid"));
};

/*
 *  returns a serialized version of the entity object
 *
 *  Note: use the client.restoreEntity() function to restore
 *
 *  @method serialize
 *  @return {string} data
 */
Usergrid.Entity.prototype.serialize = function() {
    return JSON.stringify(this._data);
};

/*
 *  gets a specific field or the entire data object. If null or no argument
 *  passed, will return all data, else, will return a specific field
 *
 *  @method get
 *  @param {string} field
 *  @return {string} || {object} data
 */
Usergrid.Entity.prototype.get = function(key) {
    var value;
    if (arguments.length === 0) {
        value = this._data;
    } else if (arguments.length > 1) {
        key = [].slice.call(arguments).reduce(function(p, c, i, a) {
            if (c instanceof Array) {
                p = p.concat(c);
            } else {
                p.push(c);
            }
            return p;
        }, []);
    }
    if (key instanceof Array) {
        var self = this;
        value = key.map(function(k) {
            return self.get(k);
        });
    } else if ("undefined" !== typeof key) {
        value = this._data[key];
    }
    return value;
};

/*
 *  adds a specific key value pair or object to the Entity's data
 *  is additive - will not overwrite existing values unless they
 *  are explicitly specified
 *
 *  @method set
 *  @param {string} key || {object}
 *  @param {string} value
 *  @return none
 */
Usergrid.Entity.prototype.set = function(key, value) {
    if (typeof key === "object") {
        for (var field in key) {
            this._data[field] = key[field];
        }
    } else if (typeof key === "string") {
        if (value === null) {
            delete this._data[key];
        } else {
            this._data[key] = value;
        }
    } else {
        this._data = {};
    }
};

Usergrid.Entity.prototype.getEndpoint = function() {
    var type = this.get("type"), nameProperties = [ "uuid", "name" ], name;
    if (type === undefined) {
        throw new UsergridError("cannot fetch entity, no entity type specified", "no_type_specified");
    } else if (/^users?$/.test(type)) {
        nameProperties.unshift("username");
    }
    name = this.get(nameProperties).filter(function(x) {
        return x !== null && "undefined" !== typeof x;
    }).shift();
    return name ? [ type, name ].join("/") : type;
};

/*
 *  Saves the entity back to the database
 *
 *  @method save
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, response, self)
 */
Usergrid.Entity.prototype.save = function(callback) {
    var self = this, type = this.get("type"), method = "POST", entityId = this.get("uuid"), changePassword, entityData = this.get(), options = {
        method: method,
        endpoint: type
    };
    if (entityId) {
        options.method = "PUT";
        options.endpoint += "/" + entityId;
    }
    options.body = Object.keys(entityData).filter(function(key) {
        return ENTITY_SYSTEM_PROPERTIES.indexOf(key) === -1;
    }).reduce(function(data, key) {
        data[key] = entityData[key];
        return data;
    }, {});
    self._client.request(options, function(err, response) {
        var entity = response.getEntity();
        if (entity) {
            self.set(entity);
            self.set("type", /^\//.test(response.path) ? response.path.substring(1) : response.path);
        }
        if (err && self._client.logging) {
            console.log("could not save entity");
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *
 * Updates the user's password
 */
Usergrid.Entity.prototype.changePassword = function(oldpassword, newpassword, callback) {
    var self = this;
    if ("function" === typeof oldpassword && callback === undefined) {
        callback = oldpassword;
        oldpassword = self.get("oldpassword");
        newpassword = self.get("newpassword");
    }
    self.set({
        password: null,
        oldpassword: null,
        newpassword: null
    });
    if (/^users?$/.test(self.get("type")) && oldpassword && newpassword) {
        var options = {
            method: "PUT",
            endpoint: "users/" + self.get("uuid") + "/password",
            body: {
                uuid: self.get("uuid"),
                username: self.get("username"),
                oldpassword: oldpassword,
                newpassword: newpassword
            }
        };
        self._client.request(options, function(err, response) {
            if (err && self._client.logging) {
                console.log("could not update user");
            }
            doCallback(callback, [ err, response, self ], self);
        });
    } else {
        throw new UsergridInvalidArgumentError("Invalid arguments passed to 'changePassword'");
    }
};

/*
 *  refreshes the entity by making a GET call back to the database
 *
 *  @method fetch
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Usergrid.Entity.prototype.fetch = function(callback) {
    var endpoint, self = this;
    endpoint = this.getEndpoint();
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        var entity = response.getEntity();
        if (entity) {
            self.set(entity);
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  deletes the entity from the database - will only delete
 *  if the object has a valid uuid
 *
 *  @method destroy
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Usergrid.Entity.prototype.destroy = function(callback) {
    var self = this;
    var endpoint = this.getEndpoint();
    var options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (!err) {
            self.set(null);
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  connects one entity to another
 *
 *  @method connect
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Usergrid.Entity.prototype.connect = function(connection, entity, callback) {
    this.addOrRemoveConnection("POST", connection, entity, callback);
};

/*
 *  disconnects one entity from another
 *
 *  @method disconnect
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Usergrid.Entity.prototype.disconnect = function(connection, entity, callback) {
    this.addOrRemoveConnection("DELETE", connection, entity, callback);
};

/*
 *  adds or removes a connection between two entities
 *
 *  @method addOrRemoveConnection
 *  @public
 *  @param {string} method
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Usergrid.Entity.prototype.addOrRemoveConnection = function(method, connection, entity, callback) {
    var self = this;
    if ([ "POST", "DELETE" ].indexOf(method.toUpperCase()) == -1) {
        throw new UsergridInvalidArgumentError("invalid method for connection call. must be 'POST' or 'DELETE'");
    }
    var connecteeType = entity.get("type");
    var connectee = this.getEntityId(entity);
    if (!connectee) {
        throw new UsergridInvalidArgumentError("connectee could not be identified");
    }
    var connectorType = this.get("type");
    var connector = this.getEntityId(this);
    if (!connector) {
        throw new UsergridInvalidArgumentError("connector could not be identified");
    }
    var endpoint = [ connectorType, connector, connection, connecteeType, connectee ].join("/");
    var options = {
        method: method,
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (err && self._client.logging) {
            console.log("There was an error with the connection call");
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  returns a unique identifier for an entity
 *
 *  @method connect
 *  @public
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Usergrid.Entity.prototype.getEntityId = function(entity) {
    var id;
    if (isUUID(entity.get("uuid"))) {
        id = entity.get("uuid");
    } else if (this.get("type") === "users" || this.get("type") === "user") {
        id = entity.get("username");
    } else {
        id = entity.get("name");
    }
    return id;
};

/*
 *  gets an entities connections
 *
 *  @method getConnections
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data, connections)
 *
 */
Usergrid.Entity.prototype.getConnections = function(connection, callback) {
    var self = this;
    var connectorType = this.get("type");
    var connector = this.getEntityId(this);
    if (!connector) {
        if (typeof callback === "function") {
            var error = "Error in getConnections - no uuid specified.";
            if (self._client.logging) {
                console.log(error);
            }
            doCallback(callback, [ true, error ], self);
        }
        return;
    }
    var endpoint = connectorType + "/" + connector + "/" + connection + "/";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        self[connection] = {};
        var length = data && data.entities ? data.entities.length : 0;
        for (var i = 0; i < length; i++) {
            if (data.entities[i].type === "user") {
                self[connection][data.entities[i].username] = data.entities[i];
            } else {
                self[connection][data.entities[i].name] = data.entities[i];
            }
        }
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Usergrid.Entity.prototype.getGroups = function(callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/groups";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        self.groups = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Usergrid.Entity.prototype.getActivities = function(callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/activities";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
        }
        self.activities = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Usergrid.Entity.prototype.getFollowing = function(callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/following";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user following");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image;
        }
        self.following = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Usergrid.Entity.prototype.getFollowers = function(callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/followers";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user followers");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image;
        }
        self.followers = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Usergrid.Client.prototype.createRole = function(roleName, permissions, callback) {
    var options = {
        type: "role",
        name: roleName
    };
    this.createEntity(options, function(err, response, entity) {
        if (err) {
            doCallback(callback, [ err, response, self ]);
        } else {
            entity.assignPermissions(permissions, function(err, data) {
                if (err) {
                    doCallback(callback, [ err, response, self ]);
                } else {
                    doCallback(callback, [ err, data, data.data ], self);
                }
            });
        }
    });
};

Usergrid.Entity.prototype.getRoles = function(callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/roles";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user roles");
        }
        self.roles = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Usergrid.Entity.prototype.assignRole = function(roleName, callback) {
    var self = this;
    var type = self.get("type");
    var collection = type + "s";
    var entityID;
    if (type == "user" && this.get("username") != null) {
        entityID = self.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = self.get("name");
    } else if (this.get("uuid") != null) {
        entityID = self.get("uuid");
    }
    if (type != "users" && type != "groups") {
        doCallback(callback, [ new UsergridError("entity must be a group or user", "invalid_entity_type"), null, this ], this);
    }
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID;
    var options = {
        method: "POST",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (err) {
            console.log("Could not assign role.");
        }
        doCallback(callback, [ err, response, self ]);
    });
};

Usergrid.Entity.prototype.removeRole = function(roleName, callback) {
    var self = this;
    var type = self.get("type");
    var collection = type + "s";
    var entityID;
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    if (type != "users" && type != "groups") {
        doCallback(callback, [ new UsergridError("entity must be a group or user", "invalid_entity_type"), null, this ], this);
    }
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID;
    var options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (err) {
            console.log("Could not assign role.");
        }
        doCallback(callback, [ err, response, self ]);
    });
};

Usergrid.Entity.prototype.assignPermissions = function(permissions, callback) {
    var self = this;
    var entityID;
    var type = this.get("type");
    if (type != "user" && type != "users" && type != "group" && type != "groups" && type != "role" && type != "roles") {
        doCallback(callback, [ new UsergridError("entity must be a group, user, or role", "invalid_entity_type"), null, this ], this);
    }
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    var endpoint = type + "/" + entityID + "/permissions";
    var options = {
        method: "POST",
        endpoint: endpoint,
        body: {
            permission: permissions
        }
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not assign permissions");
        }
        doCallback(callback, [ err, data, data.data ], self);
    });
};

Usergrid.Entity.prototype.removePermissions = function(permissions, callback) {
    var self = this;
    var entityID;
    var type = this.get("type");
    if (type != "user" && type != "users" && type != "group" && type != "groups" && type != "role" && type != "roles") {
        doCallback(callback, [ new UsergridError("entity must be a group, user, or role", "invalid_entity_type"), null, this ], this);
    }
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    var endpoint = type + "/" + entityID + "/permissions";
    var options = {
        method: "DELETE",
        endpoint: endpoint,
        qs: {
            permission: permissions
        }
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not remove permissions");
        }
        doCallback(callback, [ err, data, data.params.permission ], self);
    });
};

Usergrid.Entity.prototype.getPermissions = function(callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/permissions";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user permissions");
        }
        var permissions = [];
        if (data.data) {
            var perms = data.data;
            var count = 0;
            for (var i in perms) {
                count++;
                var perm = perms[i];
                var parts = perm.split(":");
                var ops_part = "";
                var path_part = parts[0];
                if (parts.length > 1) {
                    ops_part = parts[0];
                    path_part = parts[1];
                }
                ops_part = ops_part.replace("*", "get,post,put,delete");
                var ops = ops_part.split(",");
                var ops_object = {};
                ops_object.get = "no";
                ops_object.post = "no";
                ops_object.put = "no";
                ops_object.delete = "no";
                for (var j in ops) {
                    ops_object[ops[j]] = "yes";
                }
                permissions.push({
                    operations: ops_object,
                    path: path_part,
                    perm: perm
                });
            }
        }
        self.permissions = permissions;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

/*
 *  The Collection class models Usergrid Collections.  It essentially
 *  acts as a container for holding Entity objects, while providing
 *  additional funcitonality such as paging, and saving
 *
 *  @constructor
 *  @param {string} options - configuration object
 *  @return {Collection} collection
 */
Usergrid.Collection = function(options) {
    if (options) {
        this._client = options.client;
        this._type = options.type;
        this.qs = options.qs || {};
        this._list = options.list || [];
        this._iterator = options.iterator || -1;
        this._previous = options.previous || [];
        this._next = options.next || null;
        this._cursor = options.cursor || null;
        if (options.list) {
            var count = options.list.length;
            for (var i = 0; i < count; i++) {
                var entity = this._client.restoreEntity(options.list[i]);
                this._list[i] = entity;
            }
        }
    }
};

/*
 *  method to determine whether or not the passed variable is a Usergrid Collection
 *
 *  @method isCollection
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
Usergrid.isCollection = function(obj) {
    return obj && obj instanceof Usergrid.Collection;
};

/*
 *  gets the data from the collection object for serialization
 *
 *  @method serialize
 *  @return {object} data
 */
Usergrid.Collection.prototype.serialize = function() {
    var data = {};
    data.type = this._type;
    data.qs = this.qs;
    data.iterator = this._iterator;
    data.previous = this._previous;
    data.next = this._next;
    data.cursor = this._cursor;
    this.resetEntityPointer();
    var i = 0;
    data.list = [];
    while (this.hasNextEntity()) {
        var entity = this.getNextEntity();
        data.list[i] = entity.serialize();
        i++;
    }
    data = JSON.stringify(data);
    return data;
};

/*Usergrid.Collection.prototype.addCollection = function (collectionName, options, callback) {
  self = this;
  options.client = this._client;
  var collection = new Usergrid.Collection(options, function(err, data) {
    if (typeof(callback) === 'function') {

      collection.resetEntityPointer();
      while(collection.hasNextEntity()) {
        var user = collection.getNextEntity();
        var email = user.get('email');
        var image = self._client.getDisplayImage(user.get('email'), user.get('picture'));
        user._portal_image_icon = image;
      }

      self[collectionName] = collection;
      doCallback(callback, [err, collection], self);
    }
  });
};*/
/*
 *  Populates the collection from the server
 *
 *  @method fetch
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Usergrid.Collection.prototype.fetch = function(callback) {
    var self = this;
    var qs = this.qs;
    if (this._cursor) {
        qs.cursor = this._cursor;
    } else {
        delete qs.cursor;
    }
    var options = {
        method: "GET",
        endpoint: this._type,
        qs: this.qs
    };
    this._client.request(options, function(err, response) {
        if (err && self._client.logging) {
            console.log("error getting collection");
        } else {
            self.saveCursor(response.cursor || null);
            self.resetEntityPointer();
            self._list = response.getEntities().filter(function(entity) {
                return isUUID(entity.uuid);
            }).map(function(entity) {
                var ent = new Usergrid.Entity({
                    client: self._client
                });
                ent.set(entity);
                ent.type = self._type;
                return ent;
            });
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  Adds a new Entity to the collection (saves, then adds to the local object)
 *
 *  @method addNewEntity
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data, entity)
 */
Usergrid.Collection.prototype.addEntity = function(entityObject, callback) {
    var self = this;
    entityObject.type = this._type;
    this._client.createEntity(entityObject, function(err, response, entity) {
        if (!err) {
            self.addExistingEntity(entity);
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

Usergrid.Collection.prototype.addExistingEntity = function(entity) {
    var count = this._list.length;
    this._list[count] = entity;
};

/*
 *  Removes the Entity from the collection, then destroys the object on the server
 *
 *  @method destroyEntity
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Usergrid.Collection.prototype.destroyEntity = function(entity, callback) {
    var self = this;
    entity.destroy(function(err, response) {
        if (err) {
            if (self._client.logging) {
                console.log("could not destroy entity");
            }
            doCallback(callback, [ err, response, self ], self);
        } else {
            self.fetch(callback);
        }
        self.removeEntity(entity);
    });
};

/*
 * Filters the list of entities based on the supplied criteria function
 * works like Array.prototype.filter
 *
 *  @method getEntitiesByCriteria
 *  @param {function} criteria  A function that takes each entity as an argument and returns true or false
 *  @return {Entity[]} returns a list of entities that caused the criteria function to return true
 */
Usergrid.Collection.prototype.getEntitiesByCriteria = function(criteria) {
    return this._list.filter(criteria);
};

/*
 * Returns the first entity from the list of entities based on the supplied criteria function
 * works like Array.prototype.filter
 *
 *  @method getEntitiesByCriteria
 *  @param {function} criteria  A function that takes each entity as an argument and returns true or false
 *  @return {Entity[]} returns a list of entities that caused the criteria function to return true
 */
Usergrid.Collection.prototype.getEntityByCriteria = function(criteria) {
    return this.getEntitiesByCriteria(criteria).shift();
};

/*
 * Removed an entity from the collection without destroying it on the server
 *
 *  @method removeEntity
 *  @param {object} entity
 *  @return {Entity} returns the removed entity or undefined if it was not found
 */
Usergrid.Collection.prototype.removeEntity = function(entity) {
    var removedEntity = this.getEntityByCriteria(function(item) {
        return entity.uuid === item.get("uuid");
    });
    delete this._list[this._list.indexOf(removedEntity)];
    return removedEntity;
};

/*
 *  Looks up an Entity by UUID
 *
 *  @method getEntityByUUID
 *  @param {string} UUID
 *  @param {function} callback
 *  @return {callback} callback(err, data, entity)
 */
Usergrid.Collection.prototype.getEntityByUUID = function(uuid, callback) {
    var entity = this.getEntityByCriteria(function(item) {
        return item.get("uuid") === uuid;
    });
    if (entity) {
        doCallback(callback, [ null, entity, entity ], this);
    } else {
        var options = {
            data: {
                type: this._type,
                uuid: uuid
            },
            client: this._client
        };
        entity = new Usergrid.Entity(options);
        entity.fetch(callback);
    }
};

/*
 *  Returns the first Entity of the Entity list - does not affect the iterator
 *
 *  @method getFirstEntity
 *  @return {object} returns an entity object
 */
Usergrid.Collection.prototype.getFirstEntity = function() {
    var count = this._list.length;
    if (count > 0) {
        return this._list[0];
    }
    return null;
};

/*
 *  Returns the last Entity of the Entity list - does not affect the iterator
 *
 *  @method getLastEntity
 *  @return {object} returns an entity object
 */
Usergrid.Collection.prototype.getLastEntity = function() {
    var count = this._list.length;
    if (count > 0) {
        return this._list[count - 1];
    }
    return null;
};

/*
 *  Entity iteration -Checks to see if there is a "next" entity
 *  in the list.  The first time this method is called on an entity
 *  list, or after the resetEntityPointer method is called, it will
 *  return true referencing the first entity in the list
 *
 *  @method hasNextEntity
 *  @return {boolean} true if there is a next entity, false if not
 */
Usergrid.Collection.prototype.hasNextEntity = function() {
    var next = this._iterator + 1;
    var hasNextElement = next >= 0 && next < this._list.length;
    if (hasNextElement) {
        return true;
    }
    return false;
};

/*
 *  Entity iteration - Gets the "next" entity in the list.  The first
 *  time this method is called on an entity list, or after the method
 *  resetEntityPointer is called, it will return the,
 *  first entity in the list
 *
 *  @method hasNextEntity
 *  @return {object} entity
 */
Usergrid.Collection.prototype.getNextEntity = function() {
    this._iterator++;
    var hasNextElement = this._iterator >= 0 && this._iterator <= this._list.length;
    if (hasNextElement) {
        return this._list[this._iterator];
    }
    return false;
};

/*
 *  Entity iteration - Checks to see if there is a "previous"
 *  entity in the list.
 *
 *  @method hasPrevEntity
 *  @return {boolean} true if there is a previous entity, false if not
 */
Usergrid.Collection.prototype.hasPrevEntity = function() {
    var previous = this._iterator - 1;
    var hasPreviousElement = previous >= 0 && previous < this._list.length;
    if (hasPreviousElement) {
        return true;
    }
    return false;
};

/*
 *  Entity iteration - Gets the "previous" entity in the list.
 *
 *  @method getPrevEntity
 *  @return {object} entity
 */
Usergrid.Collection.prototype.getPrevEntity = function() {
    this._iterator--;
    var hasPreviousElement = this._iterator >= 0 && this._iterator <= this._list.length;
    if (hasPreviousElement) {
        return this._list[this._iterator];
    }
    return false;
};

/*
 *  Entity iteration - Resets the iterator back to the beginning
 *  of the list
 *
 *  @method resetEntityPointer
 *  @return none
 */
Usergrid.Collection.prototype.resetEntityPointer = function() {
    this._iterator = -1;
};

/*
 * Method to save off the cursor just returned by the last API call
 *
 * @public
 * @method saveCursor
 * @return none
 */
Usergrid.Collection.prototype.saveCursor = function(cursor) {
    if (this._next !== cursor) {
        this._next = cursor;
    }
};

/*
 * Resets the paging pointer (back to original page)
 *
 * @public
 * @method resetPaging
 * @return none
 */
Usergrid.Collection.prototype.resetPaging = function() {
    this._previous = [];
    this._next = null;
    this._cursor = null;
};

/*
 *  Paging -  checks to see if there is a next page od data
 *
 *  @method hasNextPage
 *  @return {boolean} returns true if there is a next page of data, false otherwise
 */
Usergrid.Collection.prototype.hasNextPage = function() {
    return this._next;
};

/*
 *  Paging - advances the cursor and gets the next
 *  page of data from the API.  Stores returned entities
 *  in the Entity list.
 *
 *  @method getNextPage
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Usergrid.Collection.prototype.getNextPage = function(callback) {
    if (this.hasNextPage()) {
        this._previous.push(this._cursor);
        this._cursor = this._next;
        this._list = [];
        this.fetch(callback);
    }
};

/*
 *  Paging -  checks to see if there is a previous page od data
 *
 *  @method hasPreviousPage
 *  @return {boolean} returns true if there is a previous page of data, false otherwise
 */
Usergrid.Collection.prototype.hasPreviousPage = function() {
    return this._previous.length > 0;
};

/*
 *  Paging - reverts the cursor and gets the previous
 *  page of data from the API.  Stores returned entities
 *  in the Entity list.
 *
 *  @method getPreviousPage
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Usergrid.Collection.prototype.getPreviousPage = function(callback) {
    if (this.hasPreviousPage()) {
        this._next = null;
        this._cursor = this._previous.pop();
        this._list = [];
        this.fetch(callback);
    }
};

/*
 *  A class to model a Usergrid group.
 *  Set the path in the options object.
 *
 *  @constructor
 *  @param {object} options {client:client, data: {'key': 'value'}, path:'path'}
 */
Usergrid.Group = function(options, callback) {
    this._path = options.path;
    this._list = [];
    this._client = options.client;
    this._data = options.data || {};
    this._data.type = "groups";
};

/*
 *  Inherit from Usergrid.Entity.
 *  Note: This only accounts for data on the group object itself.
 *  You need to use add and remove to manipulate group membership.
 */
Usergrid.Group.prototype = new Usergrid.Entity();

/*
 *  Fetches current group data, and members.
 *
 *  @method fetch
 *  @public
 *  @param {function} callback
 *  @returns {function} callback(err, data)
 */
Usergrid.Group.prototype.fetch = function(callback) {
    var self = this;
    var groupEndpoint = "groups/" + this._path;
    var memberEndpoint = "groups/" + this._path + "/users";
    var groupOptions = {
        method: "GET",
        endpoint: groupEndpoint
    };
    var memberOptions = {
        method: "GET",
        endpoint: memberEndpoint
    };
    this._client.request(groupOptions, function(err, response) {
        if (err) {
            if (self._client.logging) {
                console.log("error getting group");
            }
            doCallback(callback, [ err, response ], self);
        } else {
            var entities = response.getEntities();
            if (entities && entities.length) {
                var groupresponse = entities.shift();
                self._client.request(memberOptions, function(err, response) {
                    if (err && self._client.logging) {
                        console.log("error getting group users");
                    } else {
                        self._list = response.getEntities().filter(function(entity) {
                            return isUUID(entity.uuid);
                        }).map(function(entity) {
                            return new Usergrid.Entity({
                                type: entity.type,
                                client: self._client,
                                uuid: entity.uuid,
                                response: entity
                            });
                        });
                    }
                    doCallback(callback, [ err, response, self ], self);
                });
            }
        }
    });
};

/*
 *  Retrieves the members of a group.
 *
 *  @method members
 *  @public
 *  @param {function} callback
 *  @return {function} callback(err, data);
 */
Usergrid.Group.prototype.members = function(callback) {
    return this._list;
};

/*
 *  Adds an existing user to the group, and refreshes the group object.
 *
 *  Options object: {user: user_entity}
 *
 *  @method add
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {function} callback(err, data)
 */
Usergrid.Group.prototype.add = function(options, callback) {
    var self = this;
    if (options.user) {
        options = {
            method: "POST",
            endpoint: "groups/" + this._path + "/users/" + options.user.get("username")
        };
        this._client.request(options, function(error, response) {
            if (error) {
                doCallback(callback, [ error, response, self ], self);
            } else {
                self.fetch(callback);
            }
        });
    } else {
        doCallback(callback, [ new UsergridError("no user specified", "no_user_specified"), null, this ], this);
    }
};

/*
 *  Removes a user from a group, and refreshes the group object.
 *
 *  Options object: {user: user_entity}
 *
 *  @method remove
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {function} callback(err, data)
 */
Usergrid.Group.prototype.remove = function(options, callback) {
    var self = this;
    if (options.user) {
        options = {
            method: "DELETE",
            endpoint: "groups/" + this._path + "/users/" + options.user.username
        };
        this._client.request(options, function(error, response) {
            if (error) {
                doCallback(callback, [ error, response, self ], self);
            } else {
                self.fetch(callback);
            }
        });
    } else {
        doCallback(callback, [ new UsergridError("no user specified", "no_user_specified"), null, this ], this);
    }
};

/*
 * Gets feed for a group.
 *
 * @public
 * @method feed
 * @param {function} callback
 * @returns {callback} callback(err, data, activities)
 */
Usergrid.Group.prototype.feed = function(callback) {
    var self = this;
    var options = {
        method: "GET",
        endpoint: "groups/" + this._path + "/feed"
    };
    this._client.request(options, function(err, response) {
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 * Creates activity and posts to group feed.
 *
 * options object: {user: user_entity, content: "activity content"}
 *
 * @public
 * @method createGroupActivity
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, entity)
 */
Usergrid.Group.prototype.createGroupActivity = function(options, callback) {
    var self = this;
    var user = options.user;
    var entity = new Usergrid.Entity({
        client: this._client,
        data: {
            actor: {
                displayName: user.get("username"),
                uuid: user.get("uuid"),
                username: user.get("username"),
                email: user.get("email"),
                picture: user.get("picture"),
                image: {
                    duration: 0,
                    height: 80,
                    url: user.get("picture"),
                    width: 80
                }
            },
            verb: "post",
            content: options.content,
            type: "groups/" + this._path + "/activities"
        }
    });
    entity.save(function(err, response, entity) {
        doCallback(callback, [ err, response, self ]);
    });
};

/*
 *  A class to model a Usergrid event.
 *
 *  @constructor
 *  @param {object} options {timestamp:0, category:'value', counters:{name : value}}
 *  @returns {callback} callback(err, event)
 */
Usergrid.Counter = function(options) {
    this._client = options.client;
    this._data = options.data || {};
    this._data.category = options.category || "UNKNOWN";
    this._data.timestamp = options.timestamp || 0;
    this._data.type = "events";
    this._data.counters = options.counters || {};
};

var COUNTER_RESOLUTIONS = [ "all", "minute", "five_minutes", "half_hour", "hour", "six_day", "day", "week", "month" ];

/*
 *  Inherit from Usergrid.Entity.
 *  Note: This only accounts for data on the group object itself.
 *  You need to use add and remove to manipulate group membership.
 */
Usergrid.Counter.prototype = new Usergrid.Entity();

/*
 * overrides Entity.prototype.fetch. Returns all data for counters
 * associated with the object as specified in the constructor
 *
 * @public
 * @method increment
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Usergrid.Counter.prototype.fetch = function(callback) {
    this.getData({}, callback);
};

/*
 * increments the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method increment
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Usergrid.Counter.prototype.increment = function(options, callback) {
    var self = this, name = options.name, value = options.value;
    if (!name) {
        return doCallback(callback, [ new UsergridInvalidArgumentError("'name' for increment, decrement must be a number"), null, self ], self);
    } else if (isNaN(value)) {
        return doCallback(callback, [ new UsergridInvalidArgumentError("'value' for increment, decrement must be a number"), null, self ], self);
    } else {
        self._data.counters[name] = parseInt(value) || 1;
        return self.save(callback);
    }
};

/*
 * decrements the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method decrement
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Usergrid.Counter.prototype.decrement = function(options, callback) {
    var self = this, name = options.name, value = options.value;
    self.increment({
        name: name,
        value: -(parseInt(value) || 1)
    }, callback);
};

/*
 * resets the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method reset
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Usergrid.Counter.prototype.reset = function(options, callback) {
    var self = this, name = options.name;
    self.increment({
        name: name,
        value: 0
    }, callback);
};

/*
 * gets data for one or more counters over a given
 * time period at a specified resolution
 *
 * options object: {
 *                   counters: ['counter1', 'counter2', ...],
 *                   start: epoch timestamp or ISO date string,
 *                   end: epoch timestamp or ISO date string,
 *                   resolution: one of ('all', 'minute', 'five_minutes', 'half_hour', 'hour', 'six_day', 'day', 'week', or 'month')
 *                   }
 *
 * @public
 * @method getData
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Usergrid.Counter.prototype.getData = function(options, callback) {
    var start_time, end_time, start = options.start || 0, end = options.end || Date.now(), resolution = (options.resolution || "all").toLowerCase(), counters = options.counters || Object.keys(this._data.counters), res = (resolution || "all").toLowerCase();
    if (COUNTER_RESOLUTIONS.indexOf(res) === -1) {
        res = "all";
    }
    start_time = getSafeTime(start);
    end_time = getSafeTime(end);
    var self = this;
    var params = Object.keys(counters).map(function(counter) {
        return [ "counter", encodeURIComponent(counters[counter]) ].join("=");
    });
    params.push("resolution=" + res);
    params.push("start_time=" + String(start_time));
    params.push("end_time=" + String(end_time));
    var endpoint = "counters?" + params.join("&");
    this._client.request({
        endpoint: endpoint
    }, function(err, data) {
        if (data.counters && data.counters.length) {
            data.counters.forEach(function(counter) {
                self._data.counters[counter.name] = counter.value || counter.values;
            });
        }
        return doCallback(callback, [ err, data, self ], self);
    });
};

function getSafeTime(prop) {
    var time;
    switch (typeof prop) {
      case "undefined":
        time = Date.now();
        break;

      case "number":
        time = prop;
        break;

      case "string":
        time = isNaN(prop) ? Date.parse(prop) : parseInt(prop);
        break;

      default:
        time = Date.parse(prop.toString());
    }
    return time;
}

/*
 *  A class to model a Usergrid folder.
 *
 *  @constructor
 *  @param {object} options {name:"MyPhotos", path:"/user/uploads", owner:"00000000-0000-0000-0000-000000000000" }
 *  @returns {callback} callback(err, folder)
 */
Usergrid.Folder = function(options, callback) {
    var self = this, messages = [];
    console.log("FOLDER OPTIONS", options);
    self._client = options.client;
    self._data = options.data || {};
    self._data.type = "folders";
    var missingData = [ "name", "owner", "path" ].some(function(required) {
        return !(required in self._data);
    });
    if (missingData) {
        return doCallback(callback, [ new UsergridInvalidArgumentError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self ], self);
    }
    self.save(function(err, response) {
        if (err) {
            doCallback(callback, [ new UsergridError(response), response, self ], self);
        } else {
            if (response && response.entities && response.entities.length) {
                self.set(response.entities[0]);
            }
            doCallback(callback, [ null, response, self ], self);
        }
    });
};

/*
 *  Inherit from Usergrid.Entity.
 */
Usergrid.Folder.prototype = new Usergrid.Entity();

/*
 *  fetch the folder and associated assets
 *
 *  @method fetch
 *  @public
 *  @param {function} callback(err, self)
 *  @returns {callback} callback(err, self)
 */
Usergrid.Folder.prototype.fetch = function(callback) {
    var self = this;
    Usergrid.Entity.prototype.fetch.call(self, function(err, data) {
        console.log("self", self.get());
        console.log("data", data);
        if (!err) {
            self.getAssets(function(err, response) {
                if (err) {
                    doCallback(callback, [ new UsergridError(response), resonse, self ], self);
                } else {
                    doCallback(callback, [ null, self ], self);
                }
            });
        } else {
            doCallback(callback, [ null, data, self ], self);
        }
    });
};

/*
 *  Add an asset to the folder.
 *
 *  @method addAsset
 *  @public
 *  @param {object} options {asset:(uuid || Usergrid.Asset || {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }) }
 *  @returns {callback} callback(err, folder)
 */
Usergrid.Folder.prototype.addAsset = function(options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
          case "object":
            asset = options.asset;
            if (!(asset instanceof Usergrid.Entity)) {
                asset = new Usergrid.Asset(asset);
            }
            break;

          case "string":
            if (isUUID(options.asset)) {
                asset = new Usergrid.Asset({
                    client: self._client,
                    data: {
                        uuid: options.asset,
                        type: "assets"
                    }
                });
            }
            break;
        }
        if (asset && asset instanceof Usergrid.Entity) {
            asset.fetch(function(err, data) {
                if (err) {
                    doCallback(callback, [ new UsergridError(data), data, self ], self);
                } else {
                    var endpoint = [ "folders", self.get("uuid"), "assets", asset.get("uuid") ].join("/");
                    var options = {
                        method: "POST",
                        endpoint: endpoint
                    };
                    self._client.request(options, callback);
                }
            });
        }
    } else {
        doCallback(callback, [ new UsergridInvalidArgumentError("No asset specified"), null, self ], self);
    }
};

/*
 *  Remove an asset from the folder.
 *
 *  @method removeAsset
 *  @public
 *  @param {object} options {asset:(uuid || Usergrid.Asset || {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }) }
 *  @returns {callback} callback(err, folder)
 */
Usergrid.Folder.prototype.removeAsset = function(options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
          case "object":
            asset = options.asset;
            break;

          case "string":
            if (isUUID(options.asset)) {
                asset = new Usergrid.Asset({
                    client: self._client,
                    data: {
                        uuid: options.asset,
                        type: "assets"
                    }
                });
            }
            break;
        }
        if (asset && asset !== null) {
            var endpoint = [ "folders", self.get("uuid"), "assets", asset.get("uuid") ].join("/");
            self._client.request({
                method: "DELETE",
                endpoint: endpoint
            }, function(err, response) {
                if (err) {
                    doCallback(callback, [ new UsergridError(response), response, self ], self);
                } else {
                    doCallback(callback, [ null, response, self ], self);
                }
            });
        }
    } else {
        doCallback(callback, [ new UsergridInvalidArgumentError("No asset specified"), null, self ], self);
    }
};

/*
 *  List the assets in the folder.
 *
 *  @method getAssets
 *  @public
 *  @returns {callback} callback(err, assets)
 */
Usergrid.Folder.prototype.getAssets = function(callback) {
    return this.getConnections("assets", callback);
};

/*
 *  XMLHttpRequest.prototype.sendAsBinary polyfill
 *  from: https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#sendAsBinary()
 *
 *  @method sendAsBinary
 *  @param {string} sData
 */
if (!XMLHttpRequest.prototype.sendAsBinary) {
    XMLHttpRequest.prototype.sendAsBinary = function(sData) {
        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 255;
        }
        this.send(ui8Data);
    };
}

/*
 *  A class to model a Usergrid asset.
 *
 *  @constructor
 *  @param {object} options {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }
 *  @returns {callback} callback(err, asset)
 */
Usergrid.Asset = function(options, callback) {
    var self = this, messages = [];
    self._client = options.client;
    self._data = options.data || {};
    self._data.type = "assets";
    var missingData = [ "name", "owner", "path" ].some(function(required) {
        return !(required in self._data);
    });
    if (missingData) {
        doCallback(callback, [ new UsergridError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self ], self);
    } else {
        self.save(function(err, data) {
            if (err) {
                doCallback(callback, [ new UsergridError(data), data, self ], self);
            } else {
                if (data && data.entities && data.entities.length) {
                    self.set(data.entities[0]);
                }
                doCallback(callback, [ null, data, self ], self);
            }
        });
    }
};

/*
 *  Inherit from Usergrid.Entity.
 */
Usergrid.Asset.prototype = new Usergrid.Entity();

/*
 *  Add an asset to a folder.
 *
 *  @method connect
 *  @public
 *  @param {object} options {folder:"F01DE600-0000-0000-0000-000000000000"}
 *  @returns {callback} callback(err, asset)
 */
Usergrid.Asset.prototype.addToFolder = function(options, callback) {
    var self = this, error = null;
    if ("folder" in options && isUUID(options.folder)) {
        var folder = Usergrid.Folder({
            uuid: options.folder
        }, function(err, folder) {
            if (err) {
                doCallback(callback, [ UsergridError.fromResponse(folder), folder, self ], self);
            } else {
                var endpoint = [ "folders", folder.get("uuid"), "assets", self.get("uuid") ].join("/");
                var options = {
                    method: "POST",
                    endpoint: endpoint
                };
                this._client.request(options, function(err, response) {
                    if (err) {
                        doCallback(callback, [ UsergridError.fromResponse(folder), response, self ], self);
                    } else {
                        doCallback(callback, [ null, folder, self ], self);
                    }
                });
            }
        });
    } else {
        doCallback(callback, [ new UsergridError("folder not specified"), null, self ], self);
    }
};

Usergrid.Entity.prototype.attachAsset = function(file, callback) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        doCallback(callback, [ new UsergridError("The File APIs are not fully supported by your browser."), null, this ], this);
        return;
    }
    var self = this;
    var args = arguments;
    var type = this._data.type;
    var attempts = self.get("attempts");
    if (isNaN(attempts)) {
        attempts = 3;
    }
    if (type != "assets" && type != "asset") {
        var endpoint = [ this._client.clientAppURL, type, self.get("uuid") ].join("/");
    } else {
        self.set("content-type", file.type);
        self.set("size", file.size);
        var endpoint = [ this._client.clientAppURL, "assets", self.get("uuid"), "data" ].join("/");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.onerror = function(err) {
        doCallback(callback, [ new UsergridError("The File APIs are not fully supported by your browser.") ], xhr, self);
    };
    xhr.onload = function(ev) {
        if (xhr.status >= 500 && attempts > 0) {
            self.set("attempts", --attempts);
            setTimeout(function() {
                self.attachAsset.apply(self, args);
            }, 100);
        } else if (xhr.status >= 300) {
            self.set("attempts");
            doCallback(callback, [ new UsergridError(JSON.parse(xhr.responseText)), xhr, self ], self);
        } else {
            self.set("attempts");
            self.fetch();
            doCallback(callback, [ null, xhr, self ], self);
        }
    };
    var fr = new FileReader();
    fr.onload = function() {
        var binary = fr.result;
        if (type === "assets" || type === "asset") {
            xhr.overrideMimeType("application/octet-stream");
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
        }
        xhr.sendAsBinary(binary);
    };
    fr.readAsBinaryString(file);
};

/*
 *  Upload Asset data
 *
 *  @method upload
 *  @public
 *  @param {object} data Can be a javascript Blob or File object
 *  @returns {callback} callback(err, asset)
 */
Usergrid.Asset.prototype.upload = function(data, callback) {
    this.attachAsset(data, function(err, response) {
        if (!err) {
            doCallback(callback, [ null, response, self ], self);
        } else {
            doCallback(callback, [ new UsergridError(err), response, self ], self);
        }
    });
};

/*
 *  Download Asset data
 *
 *  @method download
 *  @public
 *  @returns {callback} callback(err, blob) blob is a javascript Blob object.
 */
Usergrid.Entity.prototype.downloadAsset = function(callback) {
    var self = this;
    var endpoint;
    var type = this._data.type;
    var xhr = new XMLHttpRequest();
    if (type != "assets" && type != "asset") {
        endpoint = [ this._client.clientAppURL, type, self.get("uuid") ].join("/");
    } else {
        endpoint = [ this._client.clientAppURL, "assets", self.get("uuid"), "data" ].join("/");
    }
    xhr.open("GET", endpoint, true);
    xhr.responseType = "blob";
    xhr.onload = function(ev) {
        var blob = xhr.response;
        if (type != "assets" && type != "asset") {
            doCallback(callback, [ null, blob, xhr ], self);
        } else {
            doCallback(callback, [ null, xhr, self ], self);
        }
    };
    xhr.onerror = function(err) {
        callback(true, err);
        doCallback(callback, [ new UsergridError(err), xhr, self ], self);
    };
    if (type != "assets" && type != "asset") {
        xhr.setRequestHeader("Accept", self._data["file-metadata"]["content-type"]);
    } else {
        xhr.overrideMimeType(self.get("content-type"));
    }
    xhr.send();
};

/*
 *  Download Asset data
 *
 *  @method download
 *  @public
 *  @returns {callback} callback(err, blob) blob is a javascript Blob object.
 */
Usergrid.Asset.prototype.download = function(callback) {
    this.downloadAsset(function(err, response) {
        if (!err) {
            doCallback(callback, [ null, response, self ], self);
        } else {
            doCallback(callback, [ new UsergridError(err), response, self ], self);
        }
    });
};

/**
 * Created by ryan bridges on 2014-02-05.
 */
(function(global) {
    var name = "UsergridError", short, _name = global[name], _short = short && short !== undefined ? global[short] : undefined;
    /*
     *  Instantiates a new UsergridError
     *
     *  @method UsergridError
     *  @public
     *  @params {<string>} message
     *  @params {<string>} id       - the error code, id, or name
     *  @params {<int>} timestamp
     *  @params {<int>} duration
     *  @params {<string>} exception    - the Java exception from Usergrid
     *  @return Returns - a new UsergridError object
     *
     *  Example:
     *
     *  UsergridError(message);
     */
    function UsergridError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    UsergridError.prototype = new Error();
    UsergridError.prototype.constructor = UsergridError;
    /*
     *  Creates a UsergridError from the JSON response returned from the backend
     *
     *  @method fromResponse
     *  @public
     *  @params {object} response - the deserialized HTTP response from the Usergrid API
     *  @return Returns a new UsergridError object.
     *
     *  Example:
     *  {
     *  "error":"organization_application_not_found",
     *  "timestamp":1391618508079,
     *  "duration":0,
     *  "exception":"org.usergrid.rest.exceptions.OrganizationApplicationNotFoundException",
     *  "error_description":"Could not find application for yourorgname/sandboxxxxx from URI: yourorgname/sandboxxxxx"
     *  }
     */
    UsergridError.fromResponse = function(response) {
        if (response && "undefined" !== typeof response) {
            return new UsergridError(response.error_description, response.error, response.timestamp, response.duration, response.exception);
        } else {
            return new UsergridError();
        }
    };
    UsergridError.createSubClass = function(name) {
        if (name in global && global[name]) return global[name];
        global[name] = function() {};
        global[name].name = name;
        global[name].prototype = new UsergridError();
        return global[name];
    };
    function UsergridHTTPResponseError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    UsergridHTTPResponseError.prototype = new UsergridError();
    function UsergridInvalidHTTPMethodError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_http_method";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    UsergridInvalidHTTPMethodError.prototype = new UsergridError();
    function UsergridInvalidURIError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_uri";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    UsergridInvalidURIError.prototype = new UsergridError();
    function UsergridInvalidArgumentError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_argument";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    UsergridInvalidArgumentError.prototype = new UsergridError();
    function UsergridKeystoreDatabaseUpgradeNeededError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    UsergridKeystoreDatabaseUpgradeNeededError.prototype = new UsergridError();
    global.UsergridHTTPResponseError = UsergridHTTPResponseError;
    global.UsergridInvalidHTTPMethodError = UsergridInvalidHTTPMethodError;
    global.UsergridInvalidURIError = UsergridInvalidURIError;
    global.UsergridInvalidArgumentError = UsergridInvalidArgumentError;
    global.UsergridKeystoreDatabaseUpgradeNeededError = UsergridKeystoreDatabaseUpgradeNeededError;
    global[name] = UsergridError;
    if (short !== undefined) {
        global[short] = UsergridError;
    }
    global[name].noConflict = function() {
        if (_name) {
            global[name] = _name;
        }
        if (short !== undefined) {
            global[short] = _short;
        }
        return UsergridError;
    };
    return global[name];
})(this);