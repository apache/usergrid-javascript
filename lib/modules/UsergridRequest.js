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

var UsergridRequest = function(options) {
    var self = this;
    var client = UsergridHelpers.validateAndRetrieveClient(options);

    if (!_.isString(options.type) && !_.isString(options.path) && !_.isString(options.uri)) {
        throw new Error('one of "type" (collection name), "path", or "uri" parameters are required when initializing a UsergridRequest')
    }

    if (!_.includes(['GET', 'PUT', 'POST', 'DELETE'], options.method)) {
        throw new Error('"method" parameter is required when initializing a UsergridRequest')
    }

    self.method = options.method;
    self.callback = options.callback;
    self.uri = options.uri || UsergridHelpers.uri(client, options);
    self.entity = options.entity;
    self.body = options.body || undefined;
    self.asset = options.asset || undefined;
    self.query = options.query;
    self.queryParams = options.queryParams || options.qs;

    var defaultHeadersToUse = self.asset === undefined ? UsergridHelpers.DefaultHeaders : {};
    self.headers = UsergridHelpers.headers(client, options, defaultHeadersToUse);

    if( self.query !== undefined ) {
        self.uri += UsergridHelpers.normalize(self.query.encodedStringValue, {});
    }

    if( self.queryParams !== undefined ) {
        _.forOwn(self.queryParams, function(value,key){
            self.uri += '?' + encodeURIComponent(key) + UsergridQueryOperator.EQUAL + encodeURIComponent(value);
        });
        self.uri = UsergridHelpers.normalize(self.uri,{});
    }

    if( self.asset !== undefined ) {
        self.body = new FormData();
        self.body.append(self.asset.filename, self.asset.data);
    } else {
        try{
            if( _.isPlainObject(self.body) ) {
                self.body = JSON.stringify(self.body);
            } else if( _.isArray(self.body) ) {
                self.body = JSON.stringify(self.body);
            }
        } catch( exception ) { }
    }

    return self;
};

UsergridRequest.prototype.sendRequest = function() {
    var self = this;

    var requestPromise = function() {
        var promise = new Promise();

        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open(self.method, self.uri,true);
        xmlHttpRequest.onload = function() { promise.done(xmlHttpRequest); };

        // Add any request headers
        _.forOwn(self.headers, function(value,key) {
            xmlHttpRequest.setRequestHeader(key, value);
        });

        // If we are getting something that is not JSON we must be getting an asset so set the responseType to 'blob'.
        if ( self.method === UsergridHttpMethod.GET && _.get(self.headers, "Accept") !== UsergridApplicationJSONHeaderValue) {
            xmlHttpRequest.responseType = "blob";
        }

        xmlHttpRequest.send(self.body);
        return promise;
    };

    var responsePromise = function(xmlRequest) {
        var promise = new Promise();
        var usergridResponse = new UsergridResponse(xmlRequest,self);
        promise.done(usergridResponse);
        return promise;
    };

    var onCompletePromise = function(response) {
        var promise = new Promise();
        promise.done(response);
        self.callback(response);
    };

    Promise.chain([requestPromise, responsePromise]).then(onCompletePromise);
    return self;
};