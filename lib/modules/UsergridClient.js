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
    var self = this;

    var __appAuth;
    self.tempAuth = undefined;
    self.isSharedInstance = false;

    if (arguments.length === 2) {
        self.orgId = arguments[0];
        self.appId = arguments[1];
    }

    _.defaults(self, options, defaultOptions);

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
    performRequest: function(usergridRequest,callback) {
        var self = this;

        var requestPromise = function() {
            var promise = new Promise();

            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open(usergridRequest.method.toString(),usergridRequest.uri)
            _.forOwn(usergridRequest.headers, function(value,key) {
                xmlHttpRequest.setRequestHeader(key, value)
            });
            xmlHttpRequest.open = function(m, u) {
                if (usergridRequest.body !== undefined) {
                    xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
                    xmlHttpRequest.setRequestHeader("Accept", "application/json");
                }
            };
            xmlHttpRequest.onreadystatechange = function() {
                if( this.readyState === XMLHttpRequest.DONE ) {
                    promise.done(xmlHttpRequest);
                }
            };
            xmlHttpRequest.send(UsergridHelpers.encode(usergridRequest.body))
            return promise
        }.bind(self);

        var responsePromise = function(xmlRequest) {
            var responseP = new Promise();
            var usergridResponse = new UsergridResponse(xmlRequest);
            responseP.done(usergridResponse)
            return responseP
        }.bind(self);

        var p = new Promise();
        var onComplete = function(response) {
            response.request = usergridRequest
            p.done(response);
            doCallback(callback, [response]);
        }.bind(self);

        /* and a promise to chain them all together */
        Promise.chain([requestPromise, responsePromise]).then(onComplete);
        return usergridRequest;
    },
    GET: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({ client:self,
                                                         method:UsergridHttpMethod.GET,
                                                         uri:UsergridHelpers.uri(self,UsergridHttpMethod.GET,options),
                                                         query:(options instanceof UsergridQuery ? options : options.query),
                                                         queryParams:options.queryParams,
                                                         body:UsergridHelpers.body(options) }), callback)
    },
    PUT: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({ client:self,
                                                         method:UsergridHttpMethod.PUT,
                                                         uri:UsergridHelpers.uri(self,UsergridHttpMethod.PUT,options),
                                                         query:(options instanceof UsergridQuery ? options : options.query),
                                                         queryParams:options.queryParams,
                                                         body:UsergridHelpers.body(options) }), callback)
    },
    POST: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({client:self,
                                                        method:UsergridHttpMethod.POST,
                                                        uri:UsergridHelpers.uri(self,UsergridHttpMethod.POST,options),
                                                        query:(options instanceof UsergridQuery ? options : options.query),
                                                        queryParams:options.queryParams,
                                                        body:UsergridHelpers.body(options)}), callback)
    },
    DELETE: function(options,callback) {
        var self = this;
        return self.performRequest(new UsergridRequest({client:self,
                                                        method:UsergridHttpMethod.DELETE,
                                                        uri:UsergridHelpers.uri(self,UsergridHttpMethod.DELETE,options),
                                                        query:(options instanceof UsergridQuery ? options : options.query),
                                                        queryParams:options.queryParams,
                                                        body:UsergridHelpers.body(options)}), callback)
    },
    connect: function() {
        var self = this;
        return self.performRequest(UsergridHelpers.buildConnectionRequest(this,UsergridHttpMethod.POST,UsergridHelpers.flattenArgs(arguments)), UsergridHelpers.callback(arguments))
    },
    disconnect: function() {
        var self = this;
        return self.performRequest(UsergridHelpers.buildConnectionRequest(this,UsergridHttpMethod.DELETE,UsergridHelpers.flattenArgs(arguments)), UsergridHelpers.callback(arguments))
    },
    getConnections: function() {
        var self = this
        return self.performRequest(UsergridHelpers.buildGetConnectionRequest(this,UsergridHelpers.flattenArgs(arguments)), UsergridHelpers.callback(arguments))
    },
    setAppAuth: function() {
        this.appAuth = new UsergridAppAuth(UsergridHelpers.flattenArgs(arguments))
    },
    authenticateApp: function(options) {
        var self = this
        var callback = UsergridHelpers.callback(UsergridHelpers.flattenArgs(arguments))
        var auth = _.first([options, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret)].filter(function(p) {
            return p instanceof UsergridAppAuth
        }))

        if (!(auth instanceof UsergridAppAuth)) {
            throw new Error('App auth context was not defined when attempting to call .authenticateApp()')
        } else if (!auth.clientId || !auth.clientSecret) {
            throw new Error('authenticateApp() failed because clientId or clientSecret are missing')
        }

        var authCallback = function(usergridResponse) {
            if (usergridResponse.ok) {
                if (!self.appAuth) {
                    self.appAuth = auth
                }
                self.appAuth.token = usergridResponse.responseJSON.access_token
                var expiresIn = usergridResponse.responseJSON.expires_in
                self.appAuth.expiry = Usergrid.calculateExpiry(expiresIn)
                self.appAuth.tokenTtl = expiresIn
            }
            callback(usergridResponse)
        };

        return self.performRequest(new UsergridRequest({client: self,
                                                        method:UsergridHttpMethod.POST,
                                                        uri:UsergridHelpers.uri(self,UsergridHttpMethod.POST,{path:'token'}),
                                                        body: UsergridHelpers.appLoginBody(auth)}), authCallback)
    },
    authenticateUser: function(options) {
        var self = this
        var args = UsergridHelpers.flattenArgs(arguments)
        var callback = UsergridHelpers.callback(args)
        var setAsCurrentUser = (_.last(args.filter(_.isBoolean))) !== undefined ? _.last(args.filter(_.isBoolean)) : true
        var currentUser = new UsergridUser(options)
        currentUser.login(self, function(auth, user, usergridResponse) {
            if (usergridResponse.ok && setAsCurrentUser) {
                self.currentUser = currentUser
            }
            callback(auth,user,usergridResponse)
        })
    },
    usingAuth: function(auth) {
        if( _.isString(auth) ) {
            this.tempAuth = new UsergridAuth(auth)
        } else if( auth instanceof UsergridAuth ) {
            this.tempAuth = auth
        } else {
            this.tempAuth = undefined
        }
        return this
    }
}