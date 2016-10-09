'use strict'


describe('UsergridAsset', function() {
    var asset

    describe('init from XMLHTTPRequest', function () {
        before(function (done) {
            var req = new XMLHttpRequest();
            req.open('GET', testFile, true);
            req.responseType = 'blob';
            req.onload = function () {
                asset = new UsergridAsset(req.response)
                done();
            }
            req.onerror = function (err) {
                console.error(err);
                done();
            };
            req.send(null);
        });

        it('asset.data should be a Javascript Blob', function () {
            asset.data.should.be.an.instanceOf(Blob)
        })

        it('asset.contentType should be inferred from Blob', function () {
            asset.contentType.should.equal(expectedContentType)
        })

        it('asset.contentLength should be ' + expectedContentLength + ' bytes', function () {
            asset.contentLength.should.equal(expectedContentLength)
        })
    })

    describe('upload via UsergridClient.uploadAsset() to a specific entity', function () {
        var entity = new UsergridEntity({
            type: config.test.collection,
            name: "TestClientUploadAsset"
        })
        before(function (done) {
            entity.save(client, function(response){
                response.ok.should.be.true()
                entity.should.have.property('uuid')
                done()
            })
        })
        it('should upload a binary asset to an entity', function (done) {
            client.uploadAsset(entity, asset, function (asset, assetResponse, entityWithAsset) {
                assetResponse.statusCode.should.equal(200)
                entityWithAsset.uuid.should.be.equal(entity.uuid)
                entityWithAsset.name.should.be.equal(entity.name)
                entityWithAsset.should.have.property('file-metadata')
                entityWithAsset['file-metadata'].should.have.property('content-type').equal(expectedContentType)
                entityWithAsset['file-metadata'].should.have.property('content-length').equal(expectedContentLength)
                done()
            })
        })
        after(function (done) {
            entity.remove(client, function(response){
                response.ok.should.be.true()
                entity.uuid.should.be.equal(response.entity.uuid)
                entity.name.should.be.equal(response.entity.name)
                done()
            })
        })
    })

    describe('upload via entity.uploadAsset() to a specific entity', function () {
        var entity = new UsergridEntity({
            type: config.test.collection,
            name: "TestEntityUploadAsset"
        })
        before(function (done) {
            entity.save(client, function(response){
                response.ok.should.be.true()
                entity.should.have.property('uuid')
                done()
            })
        })
        it('should upload a binary asset to an existing entity', function (done) {
            entity.attachAsset(asset)
            entity.uploadAsset(client, function (asset, assetResponse, entityWithAsset) {
                assetResponse.statusCode.should.equal(200)
                entityWithAsset.uuid.should.be.equal(entity.uuid)
                entityWithAsset.name.should.be.equal(entity.name)
                entityWithAsset.should.have.property('file-metadata')
                entityWithAsset['file-metadata'].should.have.property('content-type').equal(expectedContentType)
                entityWithAsset['file-metadata'].should.have.property('content-length').equal(expectedContentLength)
                done()
            })
        })
        after(function (done) {
            entity.remove(client, function(response){
                response.ok.should.be.true()
                entity.uuid.should.be.equal(response.entity.uuid)
                entity.name.should.be.equal(response.entity.name)
                done()
            })
        })
    })
})