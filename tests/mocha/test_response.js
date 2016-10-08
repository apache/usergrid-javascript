'use strict'

describe('UsergridResponse', function() {

    var _response, entitiesArray = []

    before(function (done){
        var entity = new UsergridEntity({
            type: config.test.collection,
            info: 'responseTestEntity'
        })
        for( var i = 0; i < 20; i++ ) {
            entitiesArray.push(entity)
        }
        client.POST(entitiesArray, function (postResponse) {
            postResponse.entities.should.be.an.Array().with.lengthOf(entitiesArray.length)
            entitiesArray = postResponse.entities
            done()
        })
    })

    before(function (done) {
        client.GET({type:config.test.collection}, function (usergridResponse) {
            _response = usergridResponse
            done()
        })
    })

    after(function(done) {
        client.DELETE(new UsergridQuery(config.test.collection).eq('info','responseTestEntity').limit(entitiesArray.length))
        done()
    })

    describe('headers', function () {
        it('should be an object', function () {
            _response.headers.should.be.an.Object().with.property('Content-Type')
        })
    })

    describe('statusCode', function () {
        it('should be a number', function () {
            _response.statusCode.should.be.a.Number()
        })
    })

    describe('ok', function () {
        it('should be a bool', function () {
            _response.ok.should.be.a.Boolean()
        })
    })

    describe('responseJSON', function () {
        it('should be a read-only object', function () {
            _response.responseJSON.should.be.an.Object().with.any.properties(['action', 'application', 'path', 'uri', 'timestamp', 'duration'])
            Object.isFrozen(_response.responseJSON).should.be.true()
            should(function () {
                _response.responseJSON.uri = 'TEST'
            }).throw()
        })
    })

    describe('error', function () {
        it('should be a UsergridResponseError object', function (done) {
            client.GET({type:config.test.collection, uuid:'BADNAMEORUUID'}, function (usergridResponse) {
                usergridResponse.error.should.be.an.instanceof(UsergridResponseError)
                done()
            })
        })
    })

    describe('users', function () {
        it('response.users should be an array of UsergridUser objects', function (done) {
            client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
            client.authenticateApp(function (response) {
                should(response.error).be.undefined()
                client.GET({type:'users'}, function (usergridResponse) {
                    usergridResponse.ok.should.be.true()
                    usergridResponse.users.should.be.an.Array()
                    usergridResponse.users.forEach(function (user) {
                        user.should.be.an.instanceof(UsergridUser)
                    })
                    done()
                })
            })
        })
    })

    describe('user', function () {
        var user

        it('response.user should be a UsergridUser object and have a valid uuid matching the first object in response.users', function (done) {
            client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl)
            client.authenticateApp(function (response) {
                should(response.error).be.undefined()
                client.GET('users', function (usergridResponse) {
                    user = usergridResponse.user
                    user.should.be.an.instanceof(UsergridUser).with.property('uuid').equal(_.first(usergridResponse.entities).uuid)
                    done()
                })
            })
        })

        it('response.user should be a subclass of UsergridEntity', function (done) {
            user.isUser.should.be.true()
            user.should.be.an.instanceof(UsergridEntity)
            done()
        })
    })

    describe('entities', function () {
        it('should be an array of UsergridEntity objects', function () {
            _response.entities.should.be.an.Array()
            _response.entities.forEach(function (entity) {
                entity.should.be.an.instanceof(UsergridEntity)
            })
        })
    })

    describe('first, entity', function () {
        it('response.first should be a UsergridEntity object and have a valid uuid matching the first object in response.entities', function () {
            _response.first.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.first(_response.entities).uuid)
        })

        it('response.entity should be a reference to response.first', function () {
            _response.should.have.property('entity').deepEqual(_response.first)
        })
    })

    describe('last', function () {
        it('last should be a UsergridEntity object and have a valid uuid matching the last object in response.entities', function () {
            _response.last.should.be.an.instanceof(UsergridEntity).with.property('uuid').equal(_.last(_response.entities).uuid)
        })
    })

    describe('hasNextPage', function () {
        it('should be true when more entities exist', function (done) {
            client.GET({type:config.test.collection}, function (usergridResponse) {
                usergridResponse.hasNextPage.should.be.true()
                done()
            })
        })

        it('should be false when no more entities exist', function (done) {
            client.GET({type:'users'}, function (usergridResponse) {
                usergridResponse.responseJSON.count.should.be.lessThan(10)
                usergridResponse.hasNextPage.should.not.be.true()
                done()
            })
        })
    })

    describe('loadNextPage()', function () {
        var firstResponse

        before(function (done) {

            var query = new UsergridQuery(config.test.collection).limit(2)

            client.GET(query, function (usergridResponse) {
                firstResponse = usergridResponse
                done()
            })
        })

        it('should load a new page of entities by passing an instance of UsergridClient', function (done) {
            firstResponse.loadNextPage(client, function (usergridResponse) {
                usergridResponse.first.uuid.should.not.equal(firstResponse.first.uuid)
                usergridResponse.entities.length.should.equal(2)
                done()
            })
        })
    })
})