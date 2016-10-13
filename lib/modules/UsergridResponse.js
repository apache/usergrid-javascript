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

var UsergridResponseError = function(options) {
    var self = this;
    _.assign(self, options);
    return self;
};

UsergridResponseError.fromJSON = function(responseErrorObject) {
    var usergridResponseError = undefined;
    var error = { name: _.get(responseErrorObject,'error') };
    if ( error.name !== undefined ) {
        _.assign(error, {
            exception: _.get(responseErrorObject,'exception'),
            description: _.get(responseErrorObject,'error_description') || _.get(responseErrorObject,'description')
        });
        usergridResponseError = new UsergridResponseError(error);
    }
    return usergridResponseError;
}

var UsergridResponse = function(xmlRequest,usergridRequest) {
    var self = this;
    self.ok = false;
    self.request = usergridRequest;

    if( xmlRequest ) {
        self.statusCode = parseInt(xmlRequest.status);
        self.ok = (self.statusCode < 400);
        self.headers = UsergridHelpers.parseResponseHeaders(xmlRequest.getAllResponseHeaders());

        var responseContentType = _.get(self.headers,'content-type');
        if( responseContentType === 'application/json' ) {
            try {
                var responseJSON = JSON.parse(xmlRequest.responseText);
            } catch (e) {
                responseJSON = {};
            }

            self.parseResponseJSON(responseJSON);

            Object.defineProperty(self, 'cursor', {
                get: function() {
                    return _.get(self,'responseJSON.cursor');
                }
            });

            Object.defineProperty(self, 'hasNextPage', {
                get: function () {
                    return self.cursor !== undefined;
                }
            });
        } else {
            self.asset = new UsergridAsset(xmlRequest.response);
        }
    }
    return self;
};

UsergridResponse.responseWithError = function(options) {
    var usergridResponse = new UsergridResponse();
    usergridResponse.error = new UsergridResponseError(options);
    return usergridResponse;
};

UsergridResponse.prototype = {
    parseResponseJSON: function(responseJSON) {
        var self = this;
        if( responseJSON !== undefined ) {
            _.assign(self, { responseJSON: _.cloneDeep(responseJSON) });
            if (self.ok) {
                var entitiesJSON = _.get(responseJSON,'entities');
                if (entitiesJSON) {
                    var entities = _.map(entitiesJSON,function(entityJSON) {
                        var entity = new UsergridEntity(entityJSON);
                        if (entity.isUser) {
                            entity = new UsergridUser(entity);
                        }
                        return entity;
                    });
                    _.assign(self, { entities: entities });
                    delete self.responseJSON.entities;

                    self.first = _.first(entities) || undefined;
                    self.entity = self.first;
                    self.last = _.last(entities) || undefined;

                    if (_.get(responseJSON, 'path') === '/users') {
                        self.user = self.first;
                        self.users = self.entities;
                    }
                    UsergridHelpers.setReadOnly(self.responseJSON);
                }
            } else {
                self.error = UsergridResponseError.fromJSON(responseJSON);
            }
        }
    },
    loadNextPage: function() {
        var self = this;
        var cursor = self.cursor;
        if (!cursor) {
            callback(UsergridResponse.responseWithError({
                name:'cursor_not_found',
                description:'Cursor must be present in order perform loadNextPage().'})
            );
        } else {
            var args = UsergridHelpers.flattenArgs(arguments);
            var callback = UsergridHelpers.callback(args);
            var client = UsergridHelpers.validateAndRetrieveClient(args);

            var type = _.last(_.get(self,'responseJSON.path').split('/'));
            var limit = _.first(_.get(self,'responseJSON.params.limit'));
            var ql = _.first(_.get(self,'responseJSON.params.ql'));

            var query = new UsergridQuery(type).fromString(ql).cursor(cursor).limit(limit);
            client.GET(query, callback);
        }
    }
};