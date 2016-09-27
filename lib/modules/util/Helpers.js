
(function(global) {
    var name = 'UsergridHelpers',
        overwrittenName = global[name];

    function UsergridHelpers() { }

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
        return _.flattenDeep(Array.prototype.slice.call(args))
    };

    UsergridHelpers.callback = function() {
        var args = _.flattenDeep(Array.prototype.slice.call(arguments)).reverse()
        var emptyFunc = function() {}
        return _.first(_.flattenDeep([args, _.get(args,'0.callback'), emptyFunc]).filter(_.isFunction))
    };

    UsergridHelpers.configureTempAuth = function(auth) {
        if (_.isString(auth) && auth !== UsergridAuthMode.NONE) {
            return new UsergridAuth(auth)
        } else if (!auth || auth === UsergridAuthMode.NONE) {
            return undefined
        } else if (auth instanceof UsergridAuth) {
            return auth
        } else {
            return undefined
        }
    };

    UsergridHelpers.userLoginBody = function(options) {
        var body = {
            grant_type: 'password',
            password: options.password
        }
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl
        }
        body[(options.username) ? "username" : "email"] = (options.username) ? options.username : options.email
        return body
    };

    UsergridHelpers.appLoginBody = function(options) {
        var body = {
            grant_type: 'client_credentials',
            client_id: options.clientId,
            client_secret: options.clientSecret
        }
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl
        }
        return body
    };

    UsergridHelpers.useQuotesIfRequired = function(value) {
        return (_.isFinite(value) || isUUID(value) || _.isBoolean(value) || _.isObject(value) && !_.isFunction(value) || _.isArray(value)) ? value : ("'" + value + "'")
    };

    UsergridHelpers.setReadOnly = function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                UsergridHelpers.setReadOnly(obj, k)
            })
        } else if (_.isPlainObject(obj[key])) {
            return Object.freeze(obj[key])
        } else if (_.isPlainObject(obj) && key === undefined) {
            return Object.freeze(obj)
        } else if (_.has(obj,key)) {
            return Object.defineProperty(obj, key, {
                writable: false
            })
        } else {
            return obj
        }
    };

    UsergridHelpers.setWritable = function(obj, key) {
        if (_.isArray(key)) {
            return key.forEach(function(k) {
                UsergridHelpers.setWritable(obj, k)
            })
            // Note that once Object.freeze is called on an object, it cannot be unfrozen, so we need to clone it
        } else if (_.isPlainObject(obj[key])) {
            return _.clone(obj[key])
        } else if (_.isPlainObject(obj) && key === undefined) {
            return _.clone(obj)
        } else if (_.has(obj,key)) {
            return Object.defineProperty(obj, key, {
                writable: true
            })
        } else {
            return obj
        }
    }

    UsergridHelpers.normalize = function(str, options) {

        // make sure protocol is followed by two slashes
        str = str.replace(/:\//g, '://');

        // remove consecutive slashes
        str = str.replace(/([^:\s])\/+/g, '$1/');

        // remove trailing slash before parameters or hash
        str = str.replace(/\/(\?|&|#[^!])/g, '$1');

        // replace ? in parameters with &
        str = str.replace(/(\?.+)\?/g, '$1&');

        return str;
    }

    UsergridHelpers.urljoin = function() {
        var input = arguments;
        var options = {};

        if (typeof arguments[0] === 'object') {
            // new syntax with array and options
            input = arguments[0];
            options = arguments[1] || {};
        }

        var joined = [].slice.call(input, 0).join('/');
        return UsergridHelpers.normalize(joined, options);
    };

    UsergridHelpers.uri = function(client, options) {
        return UsergridHelpers.urljoin(
            client.baseUrl,
            client.orgId,
            client.appId,
            options.path || options.type,
            options.method !== "POST" ? _.first([
                options.uuidOrName,
                options.uuid,
                options.name,
                _.get(options,'entity.uuid'),
                _.get(options,'entity.name'),
                ""
            ].filter(_.isString)) : ""
        )
    }

    UsergridHelpers.headers = function(client, options) {
        var headers = {
            'User-Agent':'usergrid-js/v' + Usergrid.USERGRID_SDK_VERSION
        }
        _.assign(headers, options.headers)

        var token
        if (_.get(client,'tempAuth.isValid')) {
            // if ad-hoc authentication was set in the client, get the token and destroy the auth
            token = client.tempAuth.token
            client.tempAuth = undefined
        } else if (_.get(client,'currentUser.auth.isValid')) {
            // defaults to using the current user's token
            token = client.currentUser.auth.token
        } else if (_.get(client,'authFallback') === UsergridAuthMode.APP && _.get(client,'appAuth.isValid')) {
            // if auth-fallback is set to APP request will make a call using the application token
            token = client.appAuth.token
        }

        if (token) {
            _.assign(headers, {
                authorization: 'Bearer ' + token
            })
        }
        return headers
    }

    UsergridHelpers.qs = function(options) {
        return (options.query instanceof UsergridQuery) ? {
            ql: options.query._ql || undefined,
            limit: options.query._limit,
            cursor: options.query._cursor
        } : options.qs
    }

    UsergridHelpers.formData = function(options) {
        if (_.get(options,'asset.data')) {
            var formData = {}
            formData.file = {
                value: options.asset.data,
                options: {
                    filename: _.get(options,'asset.filename') || '', // UsergridAsset.DEFAULT_FILE_NAME, //FIXME!!!!
                    contentType: _.get(options,'asset.contentType') || 'application/octet-stream'
                }
            }
            if (_.has(options,'asset.name')) {
                formData.name = options.asset.name
            }
            return formData
        } else {
            return undefined
        }
    }

    UsergridHelpers.encode = function(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    result += '&' + e(i) + '=' + e(data[i]);
                }
            }
        }
        return result;
    }

    global[name] = UsergridHelpers;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return UsergridHelpers;
    };
    return global[name];
}(this));


