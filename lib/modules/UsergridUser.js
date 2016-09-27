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

'use strict'

var UsergridUser = function(obj) {

    if (! _.has(obj,'email') && !_.has(obj,'username')) {
        // This is not a user entity
        throw new Error('"email" or "username" property is required when initializing a UsergridUser object')
    }

    var self = this
    self.type = "user"

    _.assign(self, obj, UsergridEntity)
    UsergridEntity.call(self, self)

    UsergridHelpers.setWritable(self, 'name')
    return self
}

var CheckAvailable = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)
    var client = Usergrid.validateAndRetrieveClient(args)
    if (args[0] instanceof UsergridClient) {
        args.shift()
    }
    var callback = UsergridHelpers.callback(args)
    var checkQuery

    if (args[0].username && args[0].email) {
        checkQuery = new UsergridQuery('users').eq('username', args[0].username).or.eq('email', args[0].email)
    } else if (args[0].username) {
        checkQuery = new UsergridQuery('users').eq('username', args[0].username)
    } else if (args[0].email) {
        checkQuery = new UsergridQuery('users').eq('email', args[0].email)
    } else {
        throw new Error("'username' or 'email' property is required when checking for available users")
    }

    client.GET(checkQuery, function(error, usergridResponse) {
        callback(error, usergridResponse, (usergridResponse.entities.length > 0))
    }.bind(self))
}

UsergridUser.prototype = {
    uniqueId: function() {
        var self = this
        return _.first([self.uuid, self.username, self.email].filter(_.isString))
    },
    create: function() {
        var self = this
        var args = UsergridHelpers.flattenArgs(arguments)
        var client = UsergridHelpers.flattenArgs(args)
        var callback = UsergridHelpers.callback(args)
        client.POST(self, function(error, usergridResponse) {
            delete self.password
            _.assign(self, usergridResponse.user)
            callback(error, usergridResponse, usergridResponse.user)
        }.bind(self))
    },
    login: function() {
        var self = this
        var args = UsergridHelpers.flattenArgs(arguments)
        var callback = UsergridHelpers.callback(args)
        return new UsergridRequest({
            client: UsergridHelpers.validate(args),
            path: 'token',
            method: 'POST',
            body: UsergridHelpers.userLoginBody(self)
        }, function(error, usergridResponse, body) {
            delete self.password
            if (usergridResponse.ok) {
                self.auth = new UsergridUserAuth(body.user)
                self.auth.token = body.access_token
                self.auth.expiry = Usergrid.calculateExpiry(body.expires_in)
                self.auth.tokenTtl = body.expires_in
            }
            callback(error, usergridResponse, body.access_token)
        })
    },
    logout: function() {
        var self = this
        var args = UsergridHelpers.flattenArgs(arguments)
        var callback = UsergridHelpers.callback(args)
        if (!self.auth || !self.auth.isValid) {
            return callback({
                name: 'no_valid_token',
                description: 'this user does not have a valid token'
            })
        }

        var revokeAll = _.first(args.filter(_.isBoolean)) || false

        return new UsergridRequest({
            client: Usergrid.validateAndRetrieveClient(args),
            path: ['users', self.uniqueId(),('revoketoken' + ((revokeAll) ? "s" : "")) ].join('/'),
            method: 'PUT',
            qs: (!revokeAll) ? {
                token: self.auth.token
            } : undefined
        }, function(error, usergridResponse, body) {
            self.auth.destroy()
            callback(error, usergridResponse, usergridResponse.ok)
        })
    },
    logoutAllSessions: function() {
        var args = UsergridHelpers.flattenArgs(arguments)
        args = _.concat([Usergrid.validateAndRetrieveClient(args), true], args)
        return this.logout.apply(this, args)
    },
    resetPassword: function() {
        var self = this
        var args = UsergridHelpers.flattenArgs(arguments)
        var callback = UsergridHelpers.callback(args)
        var client = Usergrid.validateAndRetrieveClient(args)
        if (args[0] instanceof UsergridClient) {
            args.shift()
        }
        var body = {
            oldpassword: _.isPlainObject(args[0]) ? args[0].oldPassword : _.isString(args[0]) ? args[0] : undefined,
            newpassword: _.isPlainObject(args[0]) ? args[0].newPassword : _.isString(args[1]) ? args[1] : undefined
        }
        if (!body.oldpassword || !body.newpassword) {
            throw new Error('"oldPassword" and "newPassword" properties are required when resetting a user password')
        }
        return new UsergridRequest({
            client: client,
            path: ['users',self.uniqueId(),'password'].join('/'),
            method: 'PUT',
            body: body
        }, function(error, usergridResponse, body) {
            callback(error, usergridResponse, usergridResponse.ok)
        })
    }
}
UsergridHelpers.inherits(UsergridUser, UsergridEntity)