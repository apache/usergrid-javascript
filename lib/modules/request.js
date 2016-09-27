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

var UsergridRequest = function(options) {
    var self = this;
    var client = Usergrid.validateAndRetrieveClient(Usergrid.getInstance());

    if (!_.isString(options.type) && !_.isString(options.path) && !_.isString(options.uri)) {
        throw new Error('one of "type" (collection name), "path", or "uri" parameters are required when initializing a UsergridRequest')
    }

    if (!_.includes(['GET', 'PUT', 'POST', 'DELETE'], options.method)) {
        throw new Error('"method" parameter is required when initializing a UsergridRequest')
    }

    self.method = options.method
    self.uri = options.uri || UsergridHelpers.uri(client, options);
    self.headers = UsergridHelpers.headers(client, options)
    self.body = options.body || undefined

    self.encoding = options.encoding || null // FIXME: deal with this
    self.qs = UsergridHelpers.qs(options) // FIXME: deal with this

    if( _.isPlainObject(self.body) ) {
        self.body = JSON.stringify(self.body)
    }

    var promise = new Promise();

    var request = new XMLHttpRequest();
    request.open(self.method,self.uri)
    request.open = function(m, u) {
        for (var header in self.headers) {
            if( self.headers.hasOwnProperty(header) ) {
                request.setRequestHeader(header, self.headers[header])
            }
        }
        if (self.body !== undefined) {
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
        }
    };
    request.onreadystatechange = function() {
        if( this.readyState === XMLHttpRequest.DONE ) {
            promise.done(request);
        }
    };
    request.send(UsergridHelpers.encode(self.body))
    return promise
}