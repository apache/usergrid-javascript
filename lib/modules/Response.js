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

var UsergridResponseError = function(responseErrorObject) {
    var self = this
    if (_.has(responseErrorObject,'error') === false) {
        return
    }
    self.name = responseErrorObject.error
    self.description = responseErrorObject.error_description || responseErrorObject.description
    self.exception = responseErrorObject.exception
    return self
}

var UsergridResponse = function(request) {
    var p = new Promise();
    var self = this
    self.ok = false

    if (!request) {
        return
    } else {
        self.statusCode = parseInt(request.status)
        var responseJSON;
        try {
            var responseText = request.responseText
            responseJSON = JSON.parse(responseText);
        } catch (e) {
            responseJSON = {}
        }

        if (self.statusCode < 400) {
            self.ok = true
            if (_.has(responseJSON, 'entities')) {
                var entities = responseJSON.entities.map(function (en) {
                    var entity = new UsergridEntity(en)
                    if (entity.isUser) {
                        entity = new UsergridUser(entity)
                    }
                    return entity
                })

                _.assign(self, {
                    metadata: _.cloneDeep(responseJSON),
                    entities: entities
                })
                delete self.metadata.entities

                self.first = _.first(entities) || undefined
                self.entity = self.first
                self.last = _.last(entities) || undefined

                if (_.get(self, 'metadata.path') === '/users') {
                    self.user = self.first
                    self.users = self.entities
                }

                Object.defineProperty(self, 'hasNextPage', {
                    get: function () {
                        return _.has(self, 'metadata.cursor')
                    }
                })

                UsergridHelpers.setReadOnly(self.metadata)
            }
        } else {
            _.assign(self, {
                error: new UsergridResponseError(responseJSON)
            })
        }
    }
    if (this.success) {
        p.done(this);
    } else {
        p.done(this);
    }
    return p;
}

UsergridResponse.prototype = {
    loadNextPage: function() {
        var self = this
        var args = UsergridHelpers.flattenArgs(arguments)
        var callback = UsergridHelpers.callback(args)
        if (!self.metadata.cursor) {
            callback()
        }
        var client = Usergrid.validateAndRetrieveClient(args)
        var type = _.last(_.get(self,'metadata.path').split('/'))
        var limit = _.first(_.get(this,'metadata.params.limit'))
        var query = new UsergridQuery(type).cursor(this.metadata.cursor).limit(limit)
        return client.GET(query, callback)
    }
}