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

//Hack around IE console.log
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
        doc = document.implementation.createHTMLDocument('');
        base = doc.createElement('base');
        base.href = base || window.lo;
        doc.head.appendChild(base);
        anchor = doc.createElement('a');
        anchor.href = url;
        doc.body.appendChild(anchor);
        isValid = !(anchor.href === '')
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
    return (!uuid) ? false : uuidValueRegex.test(uuid);
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
        queryString = [].slice.call(arguments)
            .reduce(function(a, b) {
                return a.concat((b instanceof Array) ? b : [b]);
            }, [])
            .filter(function(c) {
                return "object" === typeof c
            })
            .reduce(function(p, c) {
                (!(c instanceof Array)) ? p = p.concat(Object.keys(c).map(function(key) {
                    return [key, c[key]]
                })) : p.push(c);
                return p;
            }, [])
            .reduce(function(p, c) {
                ((c.length === 2) ? p.push(c) : p = p.concat(c));
                return p;
            }, [])
            .reduce(function(p, c) {
                (c[1] instanceof Array) ? c[1].forEach(function(v) {
                    p.push([c[0], v])
                }) : p.push(c);
                return p;
            }, [])
            .map(function(c) {
                c[1] = encodeURIComponent(c[1]);
                return c.join('=')
            })
            .join('&');
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
    return (f && f !== null && typeof(f) === 'function');
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
        //try {
        returnValue = callback.apply(context, params);
        /*} catch (ex) {
			if (console && console.error) {
				console.error("Callback error:", ex);
			}
		}*/
    }
    return returnValue;
}

//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    var name = 'Usergrid',
        overwrittenName = global[name];
    var VALID_REQUEST_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
    var __sharedInstance;
    var isInitialized = false

    function Usergrid() {
        this.logger = new Logger(name);
    }

    Usergrid.initSharedInstance = function(options) {
        console.warn("TRYING TO INITIALIZING SHARED INSTANCE")
        if( !this.isInitialized ) {
            console.warn("INITIALIZING SHARED INSTANCE")
            this.__sharedInstance = new UsergridClient(options)
            this.isInitialized = true
        }
        return this.__sharedInstance
    }

    Usergrid.getInstance = function () {
        return this.__sharedInstance
    }

    Usergrid.isValidEndpoint = function(endpoint) {
        //TODO actually implement this
        return true;
    };

    Usergrid.validateAndRetrieveClient = function(args) {
        var client = undefined;
        if (args instanceof UsergridClient) { client = args }
        else if (args[0] instanceof UsergridClient) { client = args[0] }
        else if (_.get(args,'client')) { client = args.client }
        else if (Usergrid.isInitialized) { client = Usergrid.getInstance() }
        else { throw new Error("this method requires either the Usergrid shared instance to be initialized or a UsergridClient instance as the first argument") }
        return client
    };

    Usergrid.calculateExpiry = function(expires_in) {
        return Date.now() + ((expires_in ? expires_in - 5 : 0) * 1000)
    };

    Usergrid.VERSION = Usergrid.USERGRID_SDK_VERSION = '0.11.0';

    global[name] = Usergrid;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Usergrid;
    };
    return global[name];
}(this));
