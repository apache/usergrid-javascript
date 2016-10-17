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

configs.forEach(function(config) {

    var client = new UsergridClient(config);

    describe('UsergridResponse ' + config.target, function () {
        this.timeout(_timeout);
        this.slow(_slow);

        var _response, entitiesArray = [];

        before(function (done) {
            var entity = new UsergridEntity({
                type: config.test.collection,
                info: 'responseTestEntity'
            });
            for (var i = 0; i < 20; i++) {
                entitiesArray.push(entity)
            }
            client.POST({
                body: entitiesArray, callback: function (error,postResponse) {
                    postResponse.entities.should.be.an.Array().with.lengthOf(entitiesArray.length);
                    entitiesArray = postResponse.entities;
                    done()
                }
            })
        });

        before(function (done) {
            client.GET(config.test.collection, function (error,usergridResponse) {
                _response = usergridResponse;
                done()
            })
        });

        after(function (done) {
            client.DELETE(new UsergridQuery(config.test.collection).eq('info', 'responseTestEntity').limit(entitiesArray.length));
            done()
        });

        describe('headers', function () {
            it('should be an object', function () {
                _response.headers.should.be.an.Object().with.property('content-type')
            })
        });

        describe('statusCode', function () {
            it('should be a number', function () {
                _response.statusCode.should.be.a.Number()
            })
        });

        describe('ok', function () {
            it('should be a bool', function () {
                _response.ok.should.be.a.Boolean()
            })
        });

        describe('responseJSON', function () {
            it('should be a read-only object', function () {
                _response.responseJSON.should.be.an.Object().with.any.properties(['action', 'application', 'path', 'uri', 'timestamp', 'duration']);
                Object.isFrozen(_response.responseJSON).should.be.true();
                should(function () {
                    _response.responseJSON.uri = 'TEST'
                }).throw()
            })
        });

        describe('error', function () {
            it('should be a UsergridResponseError object', function (done) {
                client.GET(config.test.collection, 'BADNAMEORUUID', function (error,usergridResponse) {
                    usergridResponse.error.should.be.an.instanceof(UsergridResponseError);
                    done()
                })
            })
        });

        describe('users', function () {
            it('response.users should be an array of UsergridUser objects', function (done) {
                client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl);
                client.authenticateApp(function (error,response) {
                    should(response.error).be.undefined();
                    client.GET('users', function (error,usergridResponse) {
                        usergridResponse.ok.should.be.true();
                        usergridResponse.users.should.be.an.Array();
                        usergridResponse.users.forEach(function (user) {
                            user.should.be.an.instanceof(UsergridUser)
                        });
                        done()
                    })
                })
            })
        });

        describe('user', function () {
            var user;

            it('response.user should be a UsergridUser object and have a valid uuid matching the first object in response.users', function (done) {
                client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl);
                client.authenticateApp(function (error,response) {
                    should(response.error).be.undefined();
                    client.GET('users', function (error,usergridResponse) {
                        user = usergridResponse.user;
                        user.should.be.an.instanceof(UsergridUser).with.property('uuid').equal(_.first(usergridResponse.entities).uuid);
                        done()
                    })
                })
            });

            it('response.user should be a subclass of UsergridEntity', function (done) {
                user.isUser.should.be.true();
                user.should.be.an.instanceof(UsergridEntity);
                done()
            })
        });

        describe('entities', function () {
            it('should be an array of UsergridEntity objects', function () {
                _response.entities.should.be.an.Array();
                _response.entities.forEach(function (entity) {
                    entity.should.be.an.instanceof(UsergridEntity)
                })
            })
        });

        describe('first, entity', function () {
            it('response.first should be a UsergridEntity object and have a valid uuid matching the first object in response.entities', function () {
                _response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.first(_response.entities).uuid)
            });

            it('response.entity should be a reference to response.first', function () {
                _response.should.have.property('entity').deepEqual(_response.first)
            })
        });

        describe('last', function () {
            it('last should be a UsergridEntity object and have a valid uuid matching the last object in response.entities', function () {
                _response.last.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.last(_response.entities).uuid)
            })
        });

        describe('hasNextPage', function () {
            it('should be true when more entities exist', function (done) {
                client.GET({type: config.test.collection}, function (error,usergridResponse) {
                    usergridResponse.hasNextPage.should.be.true();
                    done()
                })
            });

            it('should be false when no more entities exist', function (done) {
                client.GET({type: 'users'}, function (error,usergridResponse) {
                    usergridResponse.responseJSON.count.should.be.lessThan(10);
                    usergridResponse.hasNextPage.should.not.be.true();
                    done()
                })
            })
        });

        describe('loadNextPage()', function () {
            var firstResponse;

            before(function (done) {
                client.GET({type: config.test.collection}, function (error,usergridResponse) {
                    firstResponse = usergridResponse;
                    done()
                })
            });

            it('should load a new page of entities by passing an instance of UsergridClient', function (done) {
                firstResponse.loadNextPage(client, function (error,usergridResponse) {
                    usergridResponse.first.uuid.should.not.equal(firstResponse.first.uuid);
                    usergridResponse.entities.length.should.equal(10);
                    done()
                })
            })
        })
    })
});