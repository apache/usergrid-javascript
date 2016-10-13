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

var UsergridResponseError = function(responseErrorObject) {
    var self = this;
    if (_.has(responseErrorObject,'error') === false) {
        return;
    }
    self.name = responseErrorObject.error;
    self.description = _.get(responseErrorObject,'error_description') || responseErrorObject.description;
    self.exception = responseErrorObject.exception;
    return self;
};

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
                var responseText = xmlRequest.responseText;
                var responseJSON = JSON.parse(responseText);
            } catch (e) {
                responseJSON = {};
            }
            if (self.ok) {
                if( responseJSON !== undefined ) {
                    _.assign(self, {
                        responseJSON: _.cloneDeep(responseJSON)
                    });
                    if (_.has(responseJSON, 'entities')) {
                        var entities = _.map(responseJSON.entities,function(en) {
                            var entity = new UsergridEntity(en);
                            if (entity.isUser) {
                                entity = new UsergridUser(entity);
                            }
                            return entity;
                        });
                        _.assign(self, {
                            entities: entities
                        });
                        delete self.responseJSON.entities;

                        self.first = _.first(entities) || undefined;
                        self.entity = self.first;
                        self.last = _.last(entities) || undefined;

                        if (_.get(self, 'responseJSON.path') === '/users') {
                            self.user = self.first;
                            self.users = self.entities;
                        }

                        Object.defineProperty(self, 'hasNextPage', {
                            get: function () {
                                return _.has(self, 'responseJSON.cursor');
                            }
                        });

                        UsergridHelpers.setReadOnly(self.responseJSON);
                    }
                }
            } else {
                self.error = new UsergridResponseError(responseJSON);
            }
        } else {
            self.asset = new UsergridAsset(xmlRequest.response);
        }
    }
    return self;
};

UsergridResponse.prototype = {
    loadNextPage: function() {
        var self = this;
        var args = UsergridHelpers.flattenArgs(arguments);
        var callback = UsergridHelpers.callback(args);
        var cursor = _.get(self,'responseJSON.cursor');
        if (!cursor) {
            callback();
        }
        var client = UsergridHelpers.validateAndRetrieveClient(args);
        var type = _.last(_.get(self,'responseJSON.path').split('/'));
        var limit = _.first(_.get(this,'responseJSON.params.limit'));
        var ql = _.first(_.get(this,'responseJSON.params.ql'));
        var query = new UsergridQuery(type).fromString(ql).cursor(cursor).limit(limit);
        return client.GET(query, callback);
    }
};