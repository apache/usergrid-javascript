'use strict'

describe('Client Initialization', function() {
    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            var client = new UsergridClient(null, null)
            client.GET()
        }).throw()
    })

    // it('should initialize using properties defined in config.json', function() {
    //     var client = new UsergridClient()
    //     client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal(config.orgId)
    //     client.should.have.property('appId').equal(config.appId)
    // })

    it('should initialize when passing orgId and appId as arguments, taking precedence over config', function() {
        var client = new UsergridClient('foo', 'bar')
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal('foo')
        client.should.have.property('appId').equal('bar')
    })

    it('should initialize when passing an object containing orgId and appId, taking precedence over config', function() {
        var client = new UsergridClient({
            orgId: 'foo',
            appId: 'bar',
            baseUrl: 'https://sdk-example-test.apigee.net/appservices'
        })
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal('foo')
        client.should.have.property('appId').equal('bar')
        client.should.have.property('baseUrl').equal('https://sdk-example-test.apigee.net/appservices')
    })
})