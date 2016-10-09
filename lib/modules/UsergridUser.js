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

    _.assign(self, obj, UsergridEntity)
    UsergridEntity.call(self, "user")

    UsergridHelpers.setWritable(self, 'name')
    return self
}

UsergridUser.CheckAvailable = function() {
    var args = UsergridHelpers.flattenArgs(arguments)
    var client = UsergridHelpers.validateAndRetrieveClient(args)
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

    client.GET(checkQuery, function(usergridResponse) {
        callback(usergridResponse, usergridResponse.entities.length > 0)
    })
}
UsergridHelpers.inherits(UsergridUser, UsergridEntity)

UsergridUser.prototype.uniqueId = function() {
    var self = this
    return _.first([self.uuid, self.username, self.email].filter(_.isString))
}

UsergridUser.prototype.create = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)
    var client = UsergridHelpers.validateAndRetrieveClient(args)
    var callback = UsergridHelpers.callback(args)
    client.POST(self, function(usergridResponse) {
        delete self.password
        _.assign(self, usergridResponse.user)
        callback(usergridResponse)
    }.bind(self))
}

UsergridUser.prototype.login = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)
    var callback = UsergridHelpers.callback(args)
    var client = UsergridHelpers.validateAndRetrieveClient(args)

    client.POST({
        path: 'token',
        body: UsergridHelpers.userLoginBody(self)
    }, function (usergridResponse) {
        delete self.password
        if (usergridResponse.ok) {
            var responseJSON = usergridResponse.responseJSON
            self.auth = new UsergridUserAuth(self)
            self.auth.token = responseJSON.access_token
            self.auth.expiry = UsergridHelpers.calculateExpiry(responseJSON.expires_in)
            self.auth.tokenTtl = responseJSON.expires_in
        }
        callback(self.auth, self, usergridResponse)
    })
}

UsergridUser.prototype.logout = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)
    var callback = UsergridHelpers.callback(args)
    if (!self.auth || !self.auth.isValid) {
        var response = new UsergridResponse()
        response.error = new UsergridResponseError({
            error: 'no_valid_token',
            description: 'this user does not have a valid token'
        })
        return callback(response)
    }

    var revokeAll = _.first(args.filter(_.isBoolean)) || false
    var revokeTokenPath = ['users', self.uniqueId(),('revoketoken' + ((revokeAll) ? "s" : "")) ].join('/')
    var queryParams = undefined
    if( !revokeAll ) {
        queryParams = {token:self.auth.token}
    }
    var client = UsergridHelpers.validateAndRetrieveClient(args)

    return client.PUT({
        path: revokeTokenPath,
        queryParams: queryParams
    }, function(usergridResponse) {
        self.auth.destroy()
        callback(usergridResponse)
    })
}

UsergridUser.prototype.logoutAllSessions = function() {
    var args = UsergridHelpers.flattenArgs(arguments)
    args = _.concat([UsergridHelpers.validateAndRetrieveClient(args), true], args)
    return this.logout.apply(this, args)
}

UsergridUser.prototype.resetPassword = function() {
    var self = this
    var args = UsergridHelpers.flattenArgs(arguments)
    var callback = UsergridHelpers.callback(args)
    var client = UsergridHelpers.validateAndRetrieveClient(args)
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
    return client.PUT({
        path: ['users',self.uniqueId(),'password'].join('/'),
        body: body
    }, function(usergridResponse) {
        callback(usergridResponse)
    })
}