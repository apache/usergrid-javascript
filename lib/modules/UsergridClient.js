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

var defaultOptions = {
    baseUrl: 'https://api.usergrid.com',
    authMode: UsergridAuthMode.USER
}

var UsergridClient = function(options) {
    var self = this

    var __appAuth
    self.tempAuth = undefined
    self.isSharedInstance = false

    if (arguments.length === 2) {
        self.orgId = arguments[0]
        self.appId = arguments[1]
    }

    _.defaults(self, options, defaultOptions)

    if (!self.orgId || !self.appId) {
        throw new Error('"orgId" and "appId" parameters are required when instantiating UsergridClient')
    }

    Object.defineProperty(self, 'clientId', {
        enumerable: false
    })

    Object.defineProperty(self, 'clientSecret', {
        enumerable: false
    })

    Object.defineProperty(self, 'appAuth', {
        get: function() {
            return __appAuth
        },
        set: function(options) {
            if (options instanceof UsergridAppAuth) {
                __appAuth = options
            } else if (typeof options !== "undefined") {
                __appAuth = new UsergridAppAuth(options)
            }
        }
    })

    // if client ID and secret are defined on initialization, initialize appAuth
    if (self.clientId && self.clientSecret) {
        self.setAppAuth(self.clientId, self.clientSecret)
    }
    return self
}

UsergridClient.prototype = {
    performRequest: function(request,callback) {
        var self = this;

        var requestPromise = function() {
            return request
        }.bind(self);

        var responsePromise = function(xmlRequest) {
            return new UsergridResponse(xmlRequest);
        }.bind(self);

        var p = new Promise();
        var onComplete = function(response) {
            p.done(response);
            doCallback(callback, [response]);
        }.bind(self);

        /* and a promise to chain them all together */
        Promise.chain([requestPromise, responsePromise]).then(onComplete);
        return p;
    },
    GET: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({ client:self,
                                                         method:UsergridHttpMethod.GET,
                                                         uri:UsergridHelpers.uri(self,UsergridHttpMethod.GET,options),
                                                         query:(options instanceof UsergridQuery ? options : options.query),
                                                         body:UsergridHelpers.body(options) }), callback)
    },
    PUT: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({ client:self,
                                                         method:UsergridHttpMethod.PUT,
                                                         uri:UsergridHelpers.uri(self,UsergridHttpMethod.PUT,options),
                                                         query:(options instanceof UsergridQuery ? options : options.query),
                                                         body:UsergridHelpers.body(options) }), callback)
    },
    POST: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({client:self,
                                                        method:UsergridHttpMethod.POST,
                                                        uri:UsergridHelpers.uri(self,UsergridHttpMethod.POST,options),
                                                        query:(options instanceof UsergridQuery ? options : options.query),
                                                        body:UsergridHelpers.body(options)}), callback)
    },
    DELETE: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({client:self,
                                                        method:UsergridHttpMethod.DELETE,
                                                        uri:UsergridHelpers.uri(self,UsergridHttpMethod.DELETE,options),
                                                        query:(options instanceof UsergridQuery ? options : options.query),
                                                        body:UsergridHelpers.body(options)}), callback)
    },
    connect: function() {
        var self = this;
        return self.performRequest(new UsergridRequest({client:self,
                                                        method:UsergridHttpMethod.POST,
                                                        uri:UsergridHelpers.uri(self,UsergridHttpMethod.POST,options),
                                                        query:(options instanceof UsergridQuery ? options : options.query),
                                                        body:UsergridHelpers.body(options)}), callback)
    },
    disconnect: function() {
        return this.request(new UsergridRequest(helpers.build.connection(this, 'DELETE', helpers.args(arguments))))
    },
    getConnections: function() {
        return this.request(new UsergridRequest(helpers.build.getConnections(this, helpers.args(arguments))))
    },
    setAppAuth: function() {
        this.appAuth = new UsergridAppAuth(helpers.args(arguments))
    },
    authenticateApp: function(options) {
        var self = this
        var callback = helpers.cb(helpers.args(arguments))
        console.log(self.appAuth)//, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret))
        var auth = _.first([options, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret)].filter(function(p) {
            return p instanceof UsergridAppAuth
        }))

        if (!(auth instanceof UsergridAppAuth)) {
            throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
        } else if (!auth.clientId || !auth.clientSecret) {
            throw new Error('authenticateApp() failed because clientId or clientSecret are missing')
        }

        self.performRequest(new UsergridRequest({
            client: self,
            path: 'token',
            method: 'POST',
            body: UsergridHelpers.appLoginBody(auth)
        }, function(usergridResponse) {
            if (usergridResponse.ok) {
                if (!self.appAuth) {
                    self.appAuth = auth
                }
                self.appAuth.token = usergridResponse.responseJSON.access_token
                self.appAuth.expiry = UsergridHelpers.expiry(body.expires_in)
                self.appAuth.tokenTtl = usergridResponse.responseJSON.expires_in
            }
            callback(error, usergridResponse, usergridResponse.responseJSON.access_token)
        }))
    },
    authenticateUser: function(options) {
        var self = this
        var args = helpers.args(arguments)
        var callback = helpers.cb(args)
        var setAsCurrentUser = (_.last(args.filter(_.isBoolean))) !== undefined ? _.last(args.filter(_.isBoolean)) : true
        var UsergridUser = require('./user')
        var currentUser = new UsergridUser(options)
        currentUser.login(self, function(error, usergridResponse, token) {
            if (usergridResponse.ok && setAsCurrentUser) {
                self.currentUser = currentUser
            }
            callback(error, usergridResponse, token)
        })
    },
    usingAuth: function(auth) {
        this.tempAuth = helpers.client.configureTempAuth(auth)
        return this
    }
}