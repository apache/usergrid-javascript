
(function(global) {
    var name = 'UsergridHelpers',
        overwrittenName = global[name];

    function UsergridHelpers() { }

    UsergridHelpers.validateAndRetrieveClient = function(args) {
        var client = undefined;
        if (args instanceof UsergridClient) { client = args }
        else if (args[0] instanceof UsergridClient) { client = args[0] }
        else if (_.get(args,'client')) { client = args.client }
        else if (Usergrid.isInitialized) { client = Usergrid.getInstance() }
        else { throw new Error("this method requires either the Usergrid shared instance to be initialized or a UsergridClient instance as the first argument") }
        return client
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
        return _.flattenDeep(Array.prototype.slice.call(args))
    };

    UsergridHelpers.callback = function() {
        var args = _.flattenDeep(Array.prototype.slice.call(arguments)).reverse();
        var emptyFunc = function() {};
        return _.first(_.flattenDeep([args, _.get(args,'0.callback'), emptyFunc]).filter(_.isFunction))
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
        if( _.get(client,"tempAuth.isValid") ) {
            authForRequests = client.tempAuth
            client.tempAuth = undefined
        } else if( _.get(client,"currentUser.auth.isValid") && client.authMode === UsergridAuthMode.USER ) {
            authForRequests = client.currentUser.auth
        } else if( _.get(client,"appAuth.isValid") && client.authMode === UsergridAuthMode.APP ) {
            authForRequests = client.appAuth
        }
        return authForRequests;
    }

    UsergridHelpers.userLoginBody = function(options) {
        var body = {
            grant_type: 'password',
            password: options.password
        };
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl
        }
        body[(options.username) ? "username" : "email"] = (options.username) ? options.username : options.email;
        return body
    };

    UsergridHelpers.appLoginBody = function(options) {
        var body = {
            grant_type: 'client_credentials',
            client_id: options.clientId,
            client_secret: options.clientSecret
        };
        if (options.tokenTtl) {
            body.ttl = options.tokenTtl
        }
        return body
    };

    UsergridHelpers.calculateExpiry = function(expires_in) {
        return Date.now() + ((expires_in ? expires_in - 5 : 0) * 1000)
    };

    var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    UsergridHelpers.isUUID = function(uuid) {
        return (!uuid) ? false : uuidValueRegex.test(uuid);
    };

    UsergridHelpers.useQuotesIfRequired = function(value) {
        return (_.isFinite(value) || UsergridHelpers.isUUID(value) || _.isBoolean(value) || _.isObject(value) && !_.isFunction(value) || _.isArray(value)) ? value : ("'" + value + "'")
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
            });
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
    };

    UsergridHelpers.assignPrefabOptions = function(args) {
        // if a preformatted options argument passed, assign it to options
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && _.has(args,"method")) {
            _.assign(this, args[0])
        }
        return this
    };

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
    };

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

    UsergridHelpers.parseResponseHeaders = function(headerStr) {
        var headers = {};
        if (!headerStr) {
            return headers;
        }
        var headerPairs = headerStr.split('\u000d\u000a');
        for (var i = 0; i < headerPairs.length; i++) {
            var headerPair = headerPairs[i];
            // Can't use split() here because it does the wrong thing
            // if the header value has the string ": " in it.
            var index = headerPair.indexOf('\u003a\u0020');
            if (index > 0) {
                var key = headerPair.substring(0, index);
                headers[key] = headerPair.substring(index + 2);
            }
        }
        return headers;
    };

    UsergridHelpers.uri = function(client, method, options) {
        var path = '';
        if( options instanceof UsergridEntity ) {
            path = options.type
        } else if( options instanceof UsergridQuery ) {
            path = options._type
        } else if( _.isString(options) ) {
            path = options
        } else if( _.isArray(options) ) {
            path = _.get(options,'0.type') || _.get(options,'0.path')
        } else {
            path = options.path || options.type || _.get(options,"entity.type") || _.get(options,"query._type") || _.get(options,'body.type')  || _.get(options,'body.path')
        }

        var uuidOrName = '';
        if( method !== UsergridHttpMethod.POST ) {
            uuidOrName = _.first([
                options.uuidOrName,
                options.uuid,
                options.name,
                _.get(options,'entity.uuid'),
                _.get(options,'entity.name'),
                _.get(options,'body.uuid'),
                _.get(options,'body.name'),
                ''
            ].filter(_.isString))
        }
        return UsergridHelpers.urljoin(client.baseUrl, client.orgId, client.appId, path, uuidOrName)
    };

    UsergridHelpers.body = function(options) {
        var rawBody = undefined;
        if( options instanceof UsergridEntity ) {
            rawBody = options
        } else {
            rawBody = options.body || options.entity || options.entities;
            if( rawBody === undefined ) {
                if( _.isArray(options) ) {
                    if( options[0] instanceof UsergridEntity ) {
                        rawBody = options
                    }
                }
            }
        }

        var returnBody = rawBody;
        if( rawBody instanceof UsergridEntity ) {
            returnBody = rawBody.jsonValue()
        } else if( rawBody instanceof Array ) {
            if( rawBody[0] instanceof UsergridEntity ) {
                returnBody = _.map(rawBody, function(entity){ return entity.jsonValue(); })
            }
        }
        return returnBody;
    }

    UsergridHelpers.updateEntityFromRemote = function(entity,usergridResponse) {
        UsergridHelpers.setWritable(entity, ['uuid', 'name', 'type', 'created'])
        _.assign(entity, usergridResponse.entity)
        UsergridHelpers.setReadOnly(entity, ['uuid', 'name', 'type', 'created'])
    }

    UsergridHelpers.headers = function(client, options) {
        var headers = { 'User-Agent':'usergrid-js/v' + Usergrid.USERGRID_SDK_VERSION };
        _.assign(headers, options.headers);

        var authForRequests = UsergridHelpers.authForRequests(client);
        if (authForRequests) {
            _.assign(headers, {
                authorization: 'Bearer ' + authForRequests.token
            })
        }
        return headers
    };

    UsergridHelpers.formData = function(options) {
        if (_.get(options,'asset.data')) {
            var formData = {};
            formData.file = {
                value: options.asset.data,
                options: {
                    filename: _.get(options,'asset.filename') || '', // UsergridAsset.DEFAULT_FILE_NAME, //FIXME!!!!
                    contentType: _.get(options,'asset.contentType') || 'application/octet-stream'
                }
            };
            if (_.has(options,'asset.name')) {
                formData.name = options.asset.name
            }
            return formData
        } else {
            return undefined
        }
    };

    UsergridHelpers.encode = function(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var encode = encodeURIComponent;
            _.forOwn(data,function(value,key){
                result += '&' + encode(key) + '=' + encode(value);
            })
        }
        return result;
    };

    UsergridHelpers.buildConnectionRequest = function(client,method,args) {
        var options = {
            client: client,
            method: method,
            entity: {},
            to: {},
        }

        UsergridHelpers.assignPrefabOptions.call(options, args)

        // handle DELETE using "from" preposition
        if (_.isObject(options.from)) {
            options.to = options.from
        }

        if( _.isObject(args[0]) && _.has(args[0],'entity') && _.has(args[0],'to') ) {
            _.assign(options.entity,args[0].entity);
            options.relationship = _.get(args,'0.relationship')
            _.assign(options.to,args[0].to);
        }

        // if an entity object or UsergridEntity instance is the first argument (source)
        if (_.isObject(args[0]) && !_.isFunction(args[0]) && _.isString(args[1])) {
            _.assign(options.entity, args[0])
            options.relationship = _.first([options.relationship, args[1]].filter(_.isString))
        }

        // if an entity object or UsergridEntity instance is the third argument (target)
        if (_.isObject(args[2]) && !_.isFunction(args[2])) {
            _.assign(options.to, args[2])
        }

        options.entity.uuidOrName = _.first([options.entity.uuidOrName, options.entity.uuid, options.entity.name, args[1]].filter(_.isString))
        if (!options.entity.type) {
            options.entity.type = _.first([options.entity.type, args[0]].filter(_.isString))
        }
        options.relationship = _.first([options.relationship, args[2]].filter(_.isString))

        if (_.isString(args[3]) && !UsergridHelpers.isUUID(args[3]) && _.isString(args[4])) {
            options.to.type = args[3]
        } else if (_.isString(args[2]) && !UsergridHelpers.isUUID(args[2]) && _.isString(args[3]) && _.isObject(args[0]) && !_.isFunction(args[0])) {
            options.to.type = args[2]
        }

        options.to.uuidOrName = _.first([options.to.uuidOrName, options.to.uuid, options.to.name, args[4], args[3], args[2]].filter(function(property) {
            return (_.isString(options.to.type) && _.isString(property) || UsergridHelpers.isUUID(property))
        }))

        if (!_.isString(options.entity.uuidOrName)) {
            throw new Error('source entity "uuidOrName" is required when connecting or disconnecting entities')
        }

        if (!_.isString(options.to.uuidOrName)) {
            throw new Error('target entity "uuidOrName" is required when connecting or disconnecting entities')
        }

        if (!_.isString(options.to.type) && !UsergridHelpers.isUUID(options.to.uuidOrName)) {
            throw new Error('target "type" (collection name) parameter is required connecting or disconnecting entities by name')
        }

        options.uri = UsergridHelpers.urljoin(
            client.baseUrl,
            client.orgId,
            client.appId,
            _.isString(options.entity.type) ? options.entity.type : "",
            _.isString(options.entity.uuidOrName) ? options.entity.uuidOrName : "",
            options.relationship,
            _.isString(options.to.type) ? options.to.type : "",
            _.isString(options.to.uuidOrName) ? options.to.uuidOrName : ""
        )

        return new UsergridRequest(options)
    };

    UsergridHelpers.buildGetConnectionRequest = function(client,args) {
        var options = {
            client: client,
            method: 'GET'
        }

        UsergridHelpers.assignPrefabOptions.call(options, args)
        if (_.isObject(args[1]) && !_.isFunction(args[1])) {
            _.assign(options, args[1])
        }

        options.direction = _.first([options.direction, args[0]].filter(function(property) {
            return (property === UsergridDirection.IN || property === UsergridDirection.OUT)
        }))

        options.relationship = _.first([options.relationship, args[3], args[2]].filter(_.isString))
        options.uuidOrName = _.first([options.uuidOrName, options.uuid, options.name, args[2]].filter(_.isString))
        options.type = _.first([options.type, args[1]].filter(_.isString))

        if (!_.isString(options.type)) {
            throw new Error('"type" (collection name) parameter is required when retrieving connections')
        }

        if (!_.isString(options.uuidOrName)) {
            throw new Error('target entity "uuidOrName" is required when retrieving connections')
        }

        options.uri = UsergridHelpers.urljoin(
            client.baseUrl,
            client.orgId,
            client.appId,
            _.isString(options.type) ? options.type : "",
            _.isString(options.uuidOrName) ? options.uuidOrName : "",
            options.direction,
            options.relationship
        )

        return new UsergridRequest(options)
    };

    global[name] = UsergridHelpers;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return UsergridHelpers;
    };
    return global[name];
}(this));


