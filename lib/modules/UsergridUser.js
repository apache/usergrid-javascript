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

"use strict";

var UsergridUser = function(obj) {

    if (! _.has(obj,"email") && !_.has(obj,"username")) {
        // This is not a user entity
        throw new Error("'email' or 'username' property is required when initializing a UsergridUser object");
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
    var callback = UsergridHelpers.callback(args);

    var username = args[0].username || args[1].username;
    var email = args[0].email || args[1].email;

    if( !username && !email ) {
        throw new Error("'username' or 'email' property is required when checking for available users");
    } else {
        var checkQuery = new UsergridQuery("users");
        if (username) {
            checkQuery.eq("username", username);
        }
        if (email) {
            checkQuery.or.eq("email", email);
        }
        client.GET(checkQuery, function(error,usergridResponse) {
            callback(error, usergridResponse, usergridResponse.entities.length > 0);
        });
    }
};
UsergridHelpers.inherits(UsergridUser, UsergridEntity);

UsergridUser.prototype.uniqueId = function() {
    var self = this;
    return _.first([self.uuid, self.username, self.email].filter(_.isString));
};

UsergridUser.prototype.create = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    var callback = UsergridHelpers.callback(args);

    client.POST(self, function(error,usergridResponse) {
        delete self.password;
        _.assign(self, usergridResponse.user);
        callback(error, usergridResponse, self);
    }.bind(self));
};

UsergridUser.prototype.login = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    var callback = UsergridHelpers.callback(args);

    client.POST("token", UsergridHelpers.userLoginBody(self), function (error,usergridResponse) {
        delete self.password;

        var responseJSON = usergridResponse.responseJSON;
        var token = _.get(responseJSON,"access_token");
        var expiresIn = _.get(responseJSON,"expires_in");

        if (usergridResponse.ok) {
            self.auth = new UsergridUserAuth(self);
            self.auth.token = token;
            self.auth.expiry = UsergridHelpers.calculateExpiry(expiresIn);
            self.auth.tokenTtl = expiresIn;
        }
        callback(error,usergridResponse,token);
    });
};

UsergridUser.prototype.logout = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    var callback = UsergridHelpers.callback(args);

    if (!self.auth || !self.auth.isValid) {
        var response = UsergridResponse.responseWithError({
            name: "no_valid_token",
            description: "this user does not have a valid token"
        });
        callback(response.error,response);
    } else {
        var revokeAll = _.first(args.filter(_.isBoolean)) || false;
        var requestOptions = {
            client: client,
            path: ["users", self.uniqueId(), ("revoketoken" + ((revokeAll) ? "s" : ""))].join("/"),
            method: UsergridHttpMethod.PUT,
            callback: function (error,usergridResponse) {
                self.auth.destroy();
                callback(error,usergridResponse,usergridResponse.ok);
            }.bind(self)
        };
        if (!revokeAll) {
            requestOptions.queryParams = {token: self.auth.token};
        }
        var request = new UsergridRequest(requestOptions);
        client.sendRequest(request);
    }
};

UsergridUser.prototype.logoutAllSessions = function() {
    var args = UsergridHelpers.flattenArgs(arguments);
    args = _.concat([UsergridHelpers.validateAndRetrieveClient(args), true], args);
    return this.logout.apply(this, args);
};

UsergridUser.prototype.resetPassword = function() {
    var self = this;
    var args = UsergridHelpers.flattenArgs(arguments);
    var client = UsergridHelpers.validateAndRetrieveClient(args);
    var callback = UsergridHelpers.callback(args);

    if (args[0] instanceof UsergridClient) {
        args.shift();
    }

    var body = UsergridHelpers.userResetPasswordBody(args);
    if (!body.oldpassword || !body.newpassword) {
        throw new Error("'oldPassword' and 'newPassword' properties are required when resetting a user password");
    }
    client.PUT(["users",self.uniqueId(),"password"].join("/"), body, callback);
};