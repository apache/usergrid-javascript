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

var UsergridResponseError = function(options) {
    var self = this;
    _.assign(self, options);
    return self;
};

UsergridResponseError.fromJSON = function(responseErrorObject) {
    var usergridResponseError;
    var error = { name: _.get(responseErrorObject,"error") };
    if ( error.name ) {
        _.assign(error, {
            exception: _.get(responseErrorObject,"exception"),
            description: _.get(responseErrorObject,"error_description") || _.get(responseErrorObject,"description")
        });
        usergridResponseError = new UsergridResponseError(error);
    }
    return usergridResponseError;
};

var UsergridResponse = function(xmlRequest,usergridRequest) {
    var self = this;
    self.ok = false;
    self.request = usergridRequest;

    if( xmlRequest ) {
        self.statusCode = parseInt(xmlRequest.status);
        self.ok = (self.statusCode < 400);
        self.headers = UsergridHelpers.parseResponseHeaders(xmlRequest.getAllResponseHeaders());

        var responseContentType = _.get(self.headers,"content-type");
        if( responseContentType === UsergridApplicationJSONHeaderValue ) {
            try {
                var responseJSON = JSON.parse(xmlRequest.responseText);
                if( responseJSON ) {
                    self.parseResponseJSON(responseJSON)
                }
            } catch (e) {}
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
        self.responseJSON = _.cloneDeep(responseJSON);
        if (self.ok) {
            self.cursor = _.get(self,"responseJSON.cursor");
            self.hasNextPage = (!_.isNil(self.cursor));
            var entitiesJSON = _.get(responseJSON,"entities");
            if (entitiesJSON) {
                self.parseResponseEntities(entitiesJSON);
                delete self.responseJSON.entities;
            }
        } else {
            self.error = UsergridResponseError.fromJSON(responseJSON);
        }
        UsergridHelpers.setReadOnly(self.responseJSON);
    },
    parseResponseEntities: function(entitiesJSON) {
        var self = this;
        self.entities = _.map(entitiesJSON,function(entityJSON) {
            var entity = new UsergridEntity(entityJSON);
            if (entity.isUser) {
                entity = new UsergridUser(entity);
            }
            return entity;
        });

        self.first = _.first(self.entities);
        self.entity = self.first;
        self.last = _.last(self.entities);

        if (_.get(self, "responseJSON.path") === "/users") {
            self.user = self.first;
            self.users = self.entities;
        }
    },
    loadNextPage: function() {
        var self = this;
        var args = UsergridHelpers.flattenArgs(arguments);
        var callback = UsergridHelpers.callback(args);
        var cursor = self.cursor;

        if (!cursor) {
            callback(UsergridResponse.responseWithError({
                name:"cursor_not_found",
                description:"Cursor must be present in order perform loadNextPage()."})
            );
        } else {
            var client = UsergridHelpers.validateAndRetrieveClient(args);

            var type = _.last(_.get(self,"responseJSON.path").split("/"));
            var limit = _.first(_.get(self,"responseJSON.params.limit"));
            var ql = _.first(_.get(self,"responseJSON.params.ql"));

            var query = new UsergridQuery(type).fromString(ql).cursor(cursor).limit(limit);
            client.GET(query, callback);
        }
    }
};