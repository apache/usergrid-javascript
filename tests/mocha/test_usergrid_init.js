'use strict'

describe('Usergrid init() / initSharedInstance()', function() {
    it('should be an instance of UsergridClient', function(done) {
        Usergrid.init(config)
        Usergrid.initSharedInstance(config)
        Usergrid.should.be.an.instanceof(UsergridClient)
        done()
    })
    it('should be initialized when defined in another module', function(done) {
        Usergrid.should.have.property('isInitialized').which.is.true()
        Usergrid.should.have.property('isSharedInstance').which.is.true()
        done()
    })
})