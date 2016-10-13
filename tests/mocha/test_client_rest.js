'use strict'

configs.forEach(function(config) {

    var client = new UsergridClient(config)

    describe('Client REST Tests ' + config.target, function () {

        var _uuid

        describe('POST()', function () {

            var response
            before(function (done) {
                client.POST({
                    type: config.test.collection, body: {
                        author: 'Sir Arthur Conan Doyle'
                    }
                }, function (usergridResponse) {
                    response = usergridResponse
                    _uuid = usergridResponse.entity.uuid
                    done()
                })
            })

            it('should not fail when a callback function is not passed', function () {
                // note: this test will NOT fail gracefully inside the Mocha event chain
                client.POST(config.test.collection, {})
            })

            it('response.ok should be true', function () {
                response.ok.should.be.true()
            })

            it('response.entities should be an array', function () {
                response.entities.should.be.an.Array().with.a.lengthOf(1)
            })

            it('response.entity should exist and have a valid uuid', function () {
                response.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid')//.which.is.a.uuid()
            })

            it('response.entity.author should equal "Sir Arthur Conan Doyle"', function () {
                response.entity.should.have.property('author').equal('Sir Arthur Conan Doyle')
            })

            it('should support creating an entity by passing a UsergridEntity object', function (done) {
                this.timeout(_timeout + 4000)

                var entity = new UsergridEntity({
                    type: config.test.collection,
                    restaurant: "Dino's Deep Dish",
                    cuisine: "pizza"
                })

                client.POST(entity, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal(entity.restaurant)
                    sleepFor(defaultSleepTime);
                    client.DELETE(usergridResponse.entity, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(usergridResponse.entity.uuid)
                        done()
                    })
                })
            })

            it('should support creating an entity by passing a UsergridEntity object with a unique name', function (done) {
                this.timeout(_timeout + 4000)

                var entity = new UsergridEntity({
                    type: config.test.collection,
                    name: randomWord()
                })
                client.POST(entity, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('name').equal(entity.name)
                    sleepFor(defaultSleepTime);
                    client.DELETE(usergridResponse.entity, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(usergridResponse.entity.uuid)
                        done()
                    })
                })
            })

            it('should support creating an entity by passing type and a body object', function (done) {
                this.timeout(_timeout + 4000)

                var options = {
                    type: config.test.collection,
                    body: {
                        restaurant: "Dino's Deep Dish",
                        cuisine: "pizza"
                    }
                };
                client.POST(options, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal("Dino's Deep Dish")
                    sleepFor(defaultSleepTime);
                    client.DELETE(usergridResponse.entity, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(usergridResponse.entity.uuid)
                        done()
                    })
                })
            })

            it('should support creating an entity by passing a body object that includes type', function (done) {
                this.timeout(_timeout + 4000)

                var options = {
                    body: {
                        type: config.test.collection,
                        restaurant: "Dino's Deep Dish",
                        cuisine: "pizza"
                    }
                };
                client.POST(options, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal("Dino's Deep Dish")
                    sleepFor(defaultSleepTime);
                    client.DELETE(usergridResponse.entity, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(usergridResponse.entity.uuid)
                        done()
                    })
                })
            })

            it('should support creating an entity by passing an array of UsergridEntity objects', function (done) {

                var entities = [
                    new UsergridEntity({
                        type: config.test.collection,
                        restaurant: "Dino's Deep Dish",
                        cuisine: "pizza"
                    }), new UsergridEntity({
                        type: config.test.collection,
                        restaurant: "Giordanos",
                        cuisine: "pizza"
                    })
                ]


                client.POST({
                    body: entities, callback: function (usergridResponse) {
                        usergridResponse.entities.should.be.an.Array().with.lengthOf(2)
                        _.forEach(usergridResponse.entities, function (entity) {
                            entity.should.be.an.Object().with.property('restaurant').equal(entity.restaurant)
                        })
                        done()
                    }
                })
            })

            it('should support creating an entity by passing a preformatted POST builder object', function (done) {

                var options = {
                    type: config.test.collection,
                    body: {
                        restaurant: "Chipotle",
                        cuisine: "mexican"
                    }
                }

                client.POST(options, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('restaurant').equal(usergridResponse.entity.restaurant)
                    usergridResponse.entity.remove(client, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(usergridResponse.entity.uuid)
                        done()
                    })
                })
            })
        })

        describe('GET()', function () {

            var response
            before(function (done) {
                client.GET({type: config.test.collection}, function (usergridResponse) {
                    response = usergridResponse
                    done()
                })
            })

            it('should not fail when a callback function is not passed', function () {
                // note: this test will NOT fail gracefully inside the Mocha event chain
                client.GET(config.test.collection)
            })

            it('response.ok should be true', function () {
                response.ok.should.be.true()
            })

            it('response.entities should be an array', function () {
                response.entities.should.be.an.Array()
            })

            it('response.first should exist and have a valid uuid', function () {
                response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid')//.which.is.a.uuid()
            })

            it('response.entity should exist and have a valid uuid', function () {
                response.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid')//.which.is.a.uuid()
            })

            it('response.last should exist and have a valid uuid', function () {
                response.last.should.be.an.instanceof(UsergridEntity).with.property('uuid')//.which.is.a.uuid()
            })

            it('each entity should match the search criteria when passing a UsergridQuery object', function (done) {
                var query = new UsergridQuery(config.test.collection).eq('author', 'Sir Arthur Conan Doyle')
                client.GET(query, function (usergridResponse) {
                    usergridResponse.entities.should.be.an.Array().with.lengthOf(1)
                    usergridResponse.entities.forEach(function (entity) {
                        entity.should.be.an.Object().with.property('author').equal('Sir Arthur Conan Doyle')
                    })
                    done()
                })
            })

            it('a single entity should be retrieved when specifying a uuid', function (done) {
                client.GET(config.test.collection, response.entity.uuid, function (usergridResponse) {
                    usergridResponse.should.have.property('entity').which.is.an.instanceof(UsergridEntity)
                    usergridResponse.entities.should.be.an.Array().with.a.lengthOf(1)
                    done()
                })
            })
        })

        describe('PUT()', function () {

            var response

            before(function (done) {
                client.PUT(config.test.collection, _uuid, {narrator: 'Peter Doyle'}, function (usergridResponse) {
                    response = usergridResponse
                    done()
                })
            })
            after(function (done) {
                client.DELETE(response.entity, function (delResponse) {
                    delResponse.entity.should.have.property('uuid').equal(response.entity.uuid)
                    done()
                })
            })

            it('should not fail when a callback function is not passed', function () {
                // note: this test will NOT fail gracefully inside the Mocha event chain
                client.PUT(config.test.collection, _uuid, {})
            })

            it('response.ok should be true', function () {
                response.ok.should.be.true()
            })

            it('response.entities should be an array with a single entity', function () {
                response.entities.should.be.an.Array().with.a.lengthOf(1)
            })

            it('response.entity should exist and its uuid should the uuid from the previous POST request', function () {
                response.entity.should.be.an.Object().with.property('uuid').equal(_uuid)
            })

            it('response.entity.narrator should be updated to "Peter Doyle"', function () {
                response.entity.should.have.property('narrator').equal('Peter Doyle')
            })

            it('should create a new entity when no uuid or name is passed', function (done) {
                this.timeout(_timeout + 4000)

                var newEntity = new UsergridEntity({
                    type: config.test.collection,
                    author: 'Frank Mills'
                })

                client.PUT(newEntity, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object()
                    usergridResponse.entity.should.be.an.instanceof(UsergridEntity).with.property('uuid')//.which.is.a.uuid()
                    usergridResponse.entity.should.have.property('author').equal('Frank Mills')
                    usergridResponse.entity.created.should.equal(usergridResponse.entity.modified)
                    sleepFor(defaultSleepTime);
                    client.DELETE(usergridResponse.entity, function (delResponse) {
                        delResponse.entity.should.be.an.Object()
                        delResponse.entity.should.have.property('uuid').equal(usergridResponse.entity.uuid)
                        done()
                    })
                })
            })

            it('should support updating the entity by passing a UsergridEntity object', function (done) {

                var updateEntity = _.assign(response.entity, {
                    publisher: {
                        name: "George Newns",
                        date: "14 October 1892",
                        country: "United Kingdom"
                    }
                })

                client.PUT(updateEntity, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('publisher').deepEqual(updateEntity.publisher)
                    done()
                })
            })

            it('should support updating an entity by passing type and a body object', function (done) {

                var options = {
                    type: config.test.collection,
                    body: {
                        uuid: response.entity.uuid,
                        updateByPassingTypeAndBody: true
                    }
                };
                client.PUT(options, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('updateByPassingTypeAndBody').equal(true)
                    done()
                })
            })

            it('should support updating an entity by passing a body object that includes type', function (done) {

                var options = {
                    type: config.test.collection,
                    body: {
                        type: config.test.collection,
                        uuid: response.entity.uuid,
                        updateByPassingBodyIncludingType: true
                    }
                };
                client.PUT(options, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('updateByPassingBodyIncludingType').equal(true)
                    done()
                })
            })

            it('should support updating a set of entities by passing an UsergridQuery object', function (done) {
                this.timeout(_timeout + 4000)

                var query = new UsergridQuery(config.test.collection).eq('cuisine', 'pizza').limit(2)
                var body = {
                    testUuid: uuid()
                }

                sleepFor(defaultSleepTime)
                client.PUT(query, body, function (usergridResponse) {
                    usergridResponse.entities.should.be.an.Array().with.lengthOf(2)
                    usergridResponse.entities.forEach(function (entity) {
                        entity.should.be.an.Object().with.property('testUuid').equal(body.testUuid)
                    })
                    var deleteQuery = new UsergridQuery(config.test.collection).eq('uuid', usergridResponse.entities[0].uuid).or.eq('uuid', usergridResponse.entities[1].uuid)
                    sleepFor(defaultSleepTime + 400);
                    client.DELETE(query, function (delResponse) {
                        delResponse.entities.should.be.an.Array().with.lengthOf(usergridResponse.entities.length)
                        done()
                    })
                })
            })

            it('should support updating an entity by passing a preformatted PUT builder object', function (done) {

                var options = {
                    uuid: response.entity.uuid,
                    type: config.test.collection,
                    body: {
                        relatedUuid: uuid()
                    }
                }

                client.PUT(options, function (usergridResponse) {
                    usergridResponse.entity.should.be.an.Object().with.property('relatedUuid').equal(options.body.relatedUuid)
                    done()
                })
            })
        })

        describe('DELETE()', function () {

            var response
            before(function (done) {
                client.DELETE(config.test.collection, _uuid, function () {
                    client.GET(config.test.collection, _uuid, function (usergridResponse) {
                        response = usergridResponse
                        done()
                    })
                })
            })

            it('should not fail when a callback function is not passed', function () {
                // note: this test will NOT fail gracefully inside the Mocha event chain
                client.DELETE(config.test.collection, _uuid)
            })

            it('should return a 404 not found', function () {
                response.statusCode.should.equal(404)
            })

            it('response.error.name should equal "entity_not_found"', function () {
                response.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
            })

            it('should support deleting an entity by passing a UsergridEntity object', function (done) {
                this.timeout(_timeout + 4000)
                var entity = new UsergridEntity({
                    type: config.test.collection,
                    command: "CTRL+ALT+DEL"
                })

                client.POST(entity, function (postResponse) {
                    postResponse.entity.should.have.property('uuid')
                    postResponse.entity.should.have.property('command').equal('CTRL+ALT+DEL')
                    sleepFor(defaultSleepTime);
                    client.DELETE(postResponse.entity, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(postResponse.entity.uuid)
                        sleepFor(defaultSleepTime);
                        client.GET(config.test.collection, postResponse.entity.uuid, function (getResponse) {
                            getResponse.ok.should.be.false()
                            getResponse.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
                            done()
                        })
                    })
                })
            })

            it('should support deleting an entity by passing type and uuid', function (done) {
                this.timeout(_timeout + 4000)
                var body = {
                    command: "CTRL+ALT+DEL"
                }

                client.POST(config.test.collection, body, function (postResponse) {
                    postResponse.entity.should.have.property('uuid')
                    postResponse.entity.should.have.property('command').equal('CTRL+ALT+DEL')
                    sleepFor(defaultSleepTime);
                    client.DELETE(config.test.collection, postResponse.entity.uuid, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(postResponse.entity.uuid)
                        sleepFor(defaultSleepTime);
                        client.GET(config.test.collection, postResponse.entity.uuid, function (getResponse) {
                            getResponse.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
                            done()
                        })
                    })
                })
            })

            it('should support deleting multiple entities by passing a UsergridQuery object', function (done) {
                this.timeout(_timeout + 4000)

                var entity = new UsergridEntity({
                    type: config.test.collection,
                    command: "CMD"
                })

                var query = new UsergridQuery(config.test.collection).eq('command', 'CMD')

                client.POST({
                    body: [entity, entity, entity, entity], callback: function (postResponse) {
                        postResponse.entities.should.be.an.Array().with.lengthOf(4)
                        sleepFor(defaultSleepTime + 400);
                        client.DELETE(query, function (delResponse) {
                            delResponse.entities.should.be.an.Array().with.lengthOf(4)
                            sleepFor(defaultSleepTime);
                            client.GET(query, function (getResponse) {
                                getResponse.entities.should.be.an.Array().with.lengthOf(0)
                                done()
                            })
                        })
                    }
                })
            })

            it('should support deleting an entity by passing a preformatted DELETE builder object', function (done) {
                this.timeout(_timeout + 4000)

                var options = {
                    type: config.test.collection,
                    body: {
                        restaurant: "IHOP",
                        cuisine: "breakfast"
                    }
                }

                client.POST(options, function (postResponse) {
                    postResponse.entity.should.have.property('uuid')
                    postResponse.entity.should.have.property('restaurant').equal('IHOP')
                    postResponse.entity.should.have.property('cuisine').equal('breakfast')
                    sleepFor(defaultSleepTime);
                    client.DELETE(config.test.collection, postResponse.entity.uuid, function (delResponse) {
                        delResponse.entity.should.have.property('uuid').equal(postResponse.entity.uuid)
                        sleepFor(defaultSleepTime);
                        client.GET(config.test.collection, postResponse.entity.uuid, function (delResponse) {
                            delResponse.error.name.should.equal((config.target === '1.0') ? 'service_resource_not_found' : 'entity_not_found')
                            done()
                        })
                    })
                })
            })
        })
    })
})