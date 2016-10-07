'use strict'

describe('UsergridResponseError', function() {

    var _response

    describe('name, description, exception', function () {

        before(function (done) {
            client.GET({type:config.test.collection, uuid:'BADNAMEORUUID'}, function (usergridResponse) {
                _response = usergridResponse
                done()
            })
        })

        it('response.statusCode should be greater than or equal to 400', function () {
            _response.ok.should.be.false()
        })

        it('response.error should be a UsergridResponseError object with name, description, and exception keys', function () {
            _response.ok.should.be.false()
            _response.error.should.be.an.instanceof(UsergridResponseError).with.properties(['name', 'description', 'exception'])
        })
    })

    describe('undefined check', function () {
        it('response.error should be undefined on a successful response', function (done) {
            client.GET({type:config.test.collection}, function (usergridResponse) {
                usergridResponse.ok.should.be.true()
                should(usergridResponse.error).be.undefined()
                done()
            })
        })
    })
})