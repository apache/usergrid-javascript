/*
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

var UsergridEntity = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)

    if (args.length === 0) {
        throw new Error('A UsergridEntity object cannot be initialized without passing one or more arguments')
    }

    self.asset = undefined;

    if (_.isPlainObject(args[0])) {
        _.assign(self, args[0])
    } else {
        if( !self.type ) {
            self.type = _.isString(args[0]) ? args[0] : undefined
        }
        if( !self.name ) {
            self.name = _.isString(args[1]) ? args[1] : undefined
        }
    }

    if (!_.isString(self.type)) {
        throw new Error('"type" (or "collection") parameter is required when initializing a UsergridEntity object')
    }

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

    UsergridHelpers.setReadOnly(self, ['uuid', 'name', 'type', 'created'])

    return self
}

UsergridEntity.prototype = {
    jsonValue: function() {
        var jsonValue = {};
        _.forOwn(this, function(value,key) {
            jsonValue[key] = value
        });
        return jsonValue
    },
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
        this.insert(key, value, Number.MAX_VALUE)
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
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)

        client.GET(this, function(usergridResponse) {
            UsergridHelpers.updateEntityFromRemote(this, usergridResponse)
            callback(usergridResponse)
        }.bind(this))
    },
    save: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)

        var uuid = this.uuid
        if( uuid === undefined ) {
            client.POST(this,function(usergridResponse) {
                UsergridHelpers.updateEntityFromRemote(this, usergridResponse)
                callback(usergridResponse, this)
            }.bind(this))
        } else {
            client.PUT(this, function(usergridResponse) {
                UsergridHelpers.updateEntityFromRemote(this, usergridResponse)
                callback(usergridResponse, this)
            }.bind(this))
        }
    },
    remove: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)

        client.DELETE(this, function(usergridResponse) {
            callback(usergridResponse, this)
        }.bind(this))
    },
    attachAsset: function(asset) {
        this.asset = asset
    },
    uploadAsset: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)
        client.uploadAsset(this,this.asset,function(asset, usergridResponse) {
            UsergridHelpers.updateEntityFromRemote(this,usergridResponse)
            this.asset = asset
            callback(asset,usergridResponse,this)
        }.bind(this))
    },
    downloadAsset: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        var callback = UsergridHelpers.callback(args)
        client.downloadAsset(this,callback)
    },
    connect: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        args[0] = this
        return client.connect.apply(client, args)
    },
    disconnect: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        args[0] = this
        return client.disconnect.apply(client, args)
    },
    getConnections: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.validateAndRetrieveClient(args)
        args.shift()
        args.splice(1, 0, this)
        return client.getConnections.apply(client, args)
    }
}
