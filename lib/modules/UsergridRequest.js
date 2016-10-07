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
    var client = Usergrid.validateAndRetrieveClient(options);

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

    self.query = options.query
    if( self.query !== undefined ) {
        self.uri += UsergridHelpers.normalize(self.query.encodedStringValue, {})
    }

    self.queryParams = options.queryParams
    if( self.queryParams !== undefined ) {
        _.forOwn(self.queryParams, function(value,key){
            self.uri += '?' + encodeURIComponent(key) + '=' + encodeURIComponent(value)
        })
        self.uri = UsergridHelpers.normalize(self.uri,{})
    }

    try{
        if( _.isPlainObject(self.body) ) {
            self.body = JSON.stringify(self.body)
        }
        if( _.isArray(self.body) ) {
            self.body = JSON.stringify(self.body)
        }
    } catch( exception ) { }

    return self
}