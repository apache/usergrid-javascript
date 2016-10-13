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

var UsergridClientDefaultOptions = {
    baseUrl: 'https://api.usergrid.com',
    authMode: UsergridAuthMode.USER
};

var UsergridClient = function(options) {
    var self = this;

    var __appAuth;
    self.tempAuth = undefined;
    self.isSharedInstance = false;

    if (arguments.length === 2) {
        self.orgId = arguments[0];
        self.appId = arguments[1];
    }

    _.defaults(self, options, UsergridClientDefaultOptions);

    if (!self.orgId || !self.appId) {
        throw new Error('"orgId" and "appId" parameters are required when instantiating UsergridClient');
    }

    Object.defineProperty(self, 'clientId', {
        enumerable: false
    });

    Object.defineProperty(self, 'clientSecret', {
        enumerable: false
    });

    Object.defineProperty(self, 'appAuth', {
        get: function() {
            return __appAuth;
        },
        set: function(options) {
            if (options instanceof UsergridAppAuth) {
                __appAuth = options;
            } else if (typeof options !== "undefined") {
                __appAuth = new UsergridAppAuth(options);
            }
        }
    });

    // if client ID and secret are defined on initialization, initialize appAuth
    if (self.clientId && self.clientSecret) {
        self.setAppAuth(self.clientId, self.clientSecret);
    }
    return self;
};

UsergridClient.prototype = {
    sendRequest: function(usergridRequest) {
        return usergridRequest.sendRequest();
    },
    GET: function() {
        var usergridRequest = UsergridHelpers.buildReqest(this,UsergridHttpMethod.GET,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    PUT: function() {
        var usergridRequest = UsergridHelpers.buildReqest(this,UsergridHttpMethod.PUT,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    POST: function() {
        var usergridRequest = UsergridHelpers.buildReqest(this,UsergridHttpMethod.POST,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    DELETE: function() {
        var usergridRequest = UsergridHelpers.buildReqest(this,UsergridHttpMethod.DELETE,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    connect: function() {
        var usergridRequest = UsergridHelpers.buildConnectionRequest(this,UsergridHttpMethod.POST,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    disconnect: function() {
        var usergridRequest = UsergridHelpers.buildConnectionRequest(this,UsergridHttpMethod.DELETE,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    getConnections: function() {
        var usergridRequest = UsergridHelpers.buildGetConnectionRequest(this,UsergridHelpers.flattenArgs(arguments));
        return this.sendRequest(usergridRequest);
    },
    usingAuth: function(auth) {
        var self = this;
        if( _.isString(auth) ) { self.tempAuth = new UsergridAuth(auth); }
        else if( auth instanceof UsergridAuth ) { self.tempAuth = auth; }
        else { self.tempAuth = undefined; }
        return self;
    },
    setAppAuth: function() {
        this.appAuth = new UsergridAppAuth(UsergridHelpers.flattenArgs(arguments));
    },
    authenticateApp: function(options) {
        var self = this;
        var authenticateAppCallback = UsergridHelpers.callback(UsergridHelpers.flattenArgs(arguments));
        var auth = _.first([options, self.appAuth, new UsergridAppAuth(options), new UsergridAppAuth(self.clientId, self.clientSecret)].filter(function(p) {
            return p instanceof UsergridAppAuth;
        }));

        if (!(auth instanceof UsergridAppAuth)) {
            throw new Error('App auth context was not defined when attempting to call .authenticateApp()');
        } else if (!auth.clientId || !auth.clientSecret) {
            throw new Error('authenticateApp() failed because clientId or clientSecret are missing');
        }

        var callback = function(error,usergridResponse) {
            var token = _.get(usergridResponse.responseJSON,'access_token');
            var expiresIn = _.get(usergridResponse.responseJSON,'expires_in');
            if (usergridResponse.ok) {
                if (!self.appAuth) {
                    self.appAuth = auth;
                }
                self.appAuth.token = token;
                self.appAuth.expiry = UsergridHelpers.calculateExpiry(expiresIn);
                self.appAuth.tokenTtl = expiresIn;
            }
            authenticateAppCallback(error,usergridResponse,token);
        };

        var usergridRequest = UsergridHelpers.buildAppAuthRequest(self,auth,callback);
        return self.sendRequest(usergridRequest);
    },
    authenticateUser: function(options) {
        var self = this;
        var args = UsergridHelpers.flattenArgs(arguments);
        var callback = UsergridHelpers.callback(args);
        var setAsCurrentUser = (_.last(args.filter(_.isBoolean))) !== undefined ? _.last(args.filter(_.isBoolean)) : true;

        var userToAuthenticate = new UsergridUser(options);
        userToAuthenticate.login(self, function(error, usergridResponse, token) {
            if (usergridResponse.ok && setAsCurrentUser) {
                self.currentUser = userToAuthenticate;
            }
            callback(usergridResponse.error,usergridResponse,token);
        })
    },
    downloadAsset: function() {
        var self = this;
        var usergridRequest = UsergridHelpers.buildReqest(self,UsergridHttpMethod.GET,UsergridHelpers.flattenArgs(arguments));
        var assetContentType = _.get(usergridRequest,'entity.file-metadata.content-type');
        if( assetContentType !== undefined ) {
            _.assign(usergridRequest.headers,{"Accept":assetContentType});
        }
        var realDownloadAssetCallback = usergridRequest.callback;
        usergridRequest.callback = function (error,usergridResponse) {
            var entity = usergridRequest.entity;
            entity.asset = usergridResponse.asset;
            realDownloadAssetCallback(error,usergridResponse,entity);
        };
        return self.sendRequest(usergridRequest);
    },
    uploadAsset: function() {
        var self = this;
        var usergridRequest = UsergridHelpers.buildReqest(self,UsergridHttpMethod.PUT,UsergridHelpers.flattenArgs(arguments));
        if (usergridRequest.asset === undefined) {
            throw new Error('An UsergridAsset was not defined when attempting to call .uploadAsset()');
        }

        var realUploadAssetCallback = usergridRequest.callback;
        usergridRequest.callback = function (error,usergridResponse) {
            var requestEntity = usergridRequest.entity;
            var responseEntity = usergridResponse.entity;
            var requestAsset = usergridRequest.asset;

            if( usergridResponse.ok && responseEntity !== undefined ) {
                UsergridHelpers.updateEntityFromRemote(requestEntity,usergridResponse);
                requestEntity.asset = requestAsset;
                if( responseEntity ) {
                    responseEntity.asset = requestAsset;
                }
            }
            realUploadAssetCallback(error,usergridResponse,requestEntity);
        };
        return self.sendRequest(usergridRequest);
    }
};