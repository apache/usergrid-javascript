function updateEntityFromRemote(usergridResponse) {
    UsergridHelpers.setWritable(this, ['uuid', 'name', 'type', 'created'])
    _.assign(this, usergridResponse.entity)
    UsergridHelpers.setReadOnly(this, ['uuid', 'name', 'type', 'created'])
}

var UsergridEntity = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)

    if (args.length === 0) {
        throw new Error('A UsergridEntity object cannot be initialized without passing one or more arguments')
    }

    if (_.isPlainObject(args[0])) {
        _.assign(self, args[0])
    } else {
        self.type = _.isString(args[0]) ? args[0] : undefined
        self.name = _.isString(args[1]) ? args[1] : undefined
    }

    if (!_.isString(self.type)) {
        throw new Error('"type" (or "collection") parameter is required when initializing a UsergridEntity object')
    }

    Object.defineProperty(self, 'tempAuth', {
        enumerable: false,
        configurable: true,
        writable: true
    })

    Object.defineProperty(self, 'isUser', {
        get: function() {
            return (self.type.toLowerCase() === 'user')
        }
    })

    Object.defineProperty(self, 'hasAsset', {
        get: function() {
            return _.has(self, 'file-metadata')
        }
    })

    self.asset = undefined

    UsergridHelpers.setReadOnly(self, ['uuid', 'name', 'type', 'created'])

    return self
}

UsergridEntity.prototype = {
    putProperty: function(key, value) {
        this[key] = value
    },
    putProperties: function(obj) {
        _.assign(this, obj)
    },
    removeProperty: function(key) {
        this.removeProperties([key])
    },
    removeProperties: function(keys) {
        var self = this
        keys.forEach(function(key) {
            delete self[key]
        })
    },
    insert: function(key, value, idx) {
        if (!_.isArray(this[key])) {
            this[key] = this[key] ? [this[key]] : []
        }
        this[key].splice.apply(this[key], [idx, 0].concat(value))
    },
    append: function(key, value) {
        this.insert(key, value, Number.MAX_SAFE_INTEGER)
    },
    prepend: function(key, value) {
        this.insert(key, value, 0)
    },
    pop: function(key) {
        if (_.isArray(this[key])) {
            this[key].pop()
        }
    },
    shift: function(key) {
        if (_.isArray(this[key])) {
            this[key].shift()
        }
    },
    reload: function() {
        var args = helpers.args(arguments)
        var client = helpers.client.validate(args)
        var callback = UsergridHelpers.callback(args)

        client.tempAuth = this.tempAuth
        this.tempAuth = undefined
        client.GET(this, function(error, usergridResponse) {
            updateEntityFromRemote.call(this, usergridResponse)
            callback(error, usergridResponse, this)
        }.bind(this))
    },
    save: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)

        client.tempAuth = this.tempAuth
        this.tempAuth = undefined
        client.PUT(this, function(error, usergridResponse) {
            updateEntityFromRemote.call(this, usergridResponse)
            callback(error, usergridResponse, this)
        }.bind(this))
    },
    remove: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)

        client.tempAuth = this.tempAuth
        this.tempAuth = undefined
        client.DELETE(this, function(error, usergridResponse) {
            callback(error, usergridResponse, this)
        }.bind(this))
    },
    attachAsset: function(asset) {
        this.asset = asset
    },
    uploadAsset: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)
        client.POST(this, this.asset, function(error, usergridResponse) {
            updateEntityFromRemote.call(this, usergridResponse)
            callback(error, usergridResponse, this)
        }.bind(this))
    },
    downloadAsset: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)
        var self = this

        if (_.has(self,'asset.contentType')) {
            var options = {
                client: client,
                entity: self,
                type: this.type,
                method: 'GET',
                encoding: null,
                headers: {
                    "Accept": self.asset.contentType || _.first(args.filter(_.isString))
                }
            }
            options.uri = helpers.build.uri(client, options) // FIXME!!!!
            return new UsergridRequest(options, function(error, usergridResponse) {
                if (usergridResponse.ok) {
                    self.attachAsset(new UsergridAsset(new Buffer(usergridResponse.body)))
                }
                callback(error, usergridResponse, self)
            })
        } else {
            callback({
                name: "asset_not_found",
                description: "The specified entity does not have a valid asset attached"
            })
        }
    },
    connect: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        client.tempAuth = this.tempAuth
        this.tempAuth = undefined
        args[0] = this
        return client.connect.apply(client, args)
    },
    disconnect: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        client.tempAuth = this.tempAuth
        this.tempAuth = undefined
        args[0] = this
        return client.disconnect.apply(client, args)
    },
    getConnections: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = Usergrid.validateAndRetrieveClient(args)
        client.tempAuth = this.tempAuth
        this.tempAuth = undefined
        args.shift()
        args.splice(1, 0, this)
        return client.getConnections.apply(client, args)
    },
    usingAuth: function(auth) {
        this.tempAuth = helpers.client.configureTempAuth(auth)
        return this
    }
}