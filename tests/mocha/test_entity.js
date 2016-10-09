
describe('UsergridEntity', function() {

    describe('putProperty()', function () {
        it('should set the value for a given key if the key does not exist', function () {
            var entity = new UsergridEntity('cat', 'Cosmo')
            entity.putProperty('foo', ['bar'])
            entity.should.have.property('foo').deepEqual(['bar'])
        })

        it('should overwrite the value for a given key if the key exists', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'baz'
            })
            entity.putProperty('foo', 'bar')
            entity.should.have.property('foo').deepEqual('bar')
        })

        it('should not be able to set the name key (name is immutable)', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'baz'
            })
            entity.putProperty('name', 'Bazinga')
            entity.should.have.property('name').deepEqual('Cosmo')
        })
    })

    describe('putProperties()', function () {
        it('should set properties for a given object, overwriting properties that exist and creating those that don\'t', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'bar'
            })
            entity.putProperties({
                foo: 'baz',
                qux: 'quux',
                barray: [1, 2, 3, 4]
            })
            entity.should.containEql({
                type: 'cat',
                name: 'Cosmo',
                foo: 'baz',
                qux: 'quux',
                barray: [1, 2, 3, 4]
            })
        })

        it('should not be able to set properties for immutable keys', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'baz'
            })
            entity.putProperties({
                name: 'Bazinga',
                uuid: 'BadUuid',
                bar: 'qux'
            })
            entity.should.containEql({
                type: 'cat',
                name: 'Cosmo',
                bar: 'qux',
                foo: 'baz'
            })
        })
    })

    describe('removeProperty()', function () {
        it('should remove a given property if it exists', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'baz'
            })
            entity.removeProperty('foo')
            entity.should.not.have.property('foo')
        })

        it('should fail gracefully when removing an undefined property', function () {
            var entity = new UsergridEntity('cat', 'Cosmo')
            entity.removeProperty('foo')
            entity.should.not.have.property('foo')
        })
    })

    describe('removeProperties()', function () {
        it('should remove an array of properties for a given object, failing gracefully for undefined properties', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'bar',
                baz: 'qux'
            })
            entity.removeProperties(['foo', 'baz'])
            entity.should.containEql({
                type: 'cat',
                name: 'Cosmo'
            })
        })
    })

    describe('insert()', function () {
        it('should insert a single value into an existing array at the specified index', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: [1, 2, 3, 5, 6]
            })
            entity.insert('foo', 4, 3)
            entity.should.have.property('foo').deepEqual([1, 2, 3, 4, 5, 6])
        })

        it('should merge an array of values into an existing array at the specified index', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: [1, 2, 3, 7, 8]
            })
            entity.insert('foo', [4, 5, 6], 3)
            entity.should.have.property('foo').deepEqual([1, 2, 3, 4, 5, 6, 7, 8])
        })

        it('should convert an existing value into an array when inserting a second value', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'bar'
            })
            entity.insert('foo', 'baz', 1)
            entity.should.have.property('foo').deepEqual(['bar', 'baz'])
        })

        it('should create a new array when a property does not exist', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo'
            })
            entity.insert('foo', 'bar', 1000)
            entity.should.have.property('foo').deepEqual(['bar'])
        })

        it('should gracefully handle indexes out of range', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: ['bar']
            })
            entity.insert('foo', 'baz', 1000)
            entity.should.have.property('foo').deepEqual(['bar', 'baz'])
            entity.insert('foo', 'qux', -1000)
            entity.should.have.property('foo').deepEqual(['qux', 'bar', 'baz'])
        })
    })

    describe('append()', function () {
        it('should append a value to the end of an existing array', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: [1, 2, 3]
            })
            entity.append('foo', 4)
            entity.should.have.property('foo').deepEqual([1, 2, 3, 4])
        })

        it('should create a new array if a property does not exist', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo'
            })
            entity.append('foo', 'bar')
            entity.should.have.property('foo').deepEqual(['bar'])
        })
    })

    describe('prepend()', function () {
        it('should prepend a value to the beginning of an existing array', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: [1, 2, 3]
            })
            entity.prepend('foo', 0)
            entity.should.have.property('foo').deepEqual([0, 1, 2, 3])
        })

        it('should create a new array if a property does not exist', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo'
            })
            entity.prepend('foo', 'bar')
            entity.should.have.property('foo').deepEqual(['bar'])
        })
    })

    describe('pop()', function () {
        it('should remove the last value of an existing array', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: [1, 2, 3]
            })
            entity.pop('foo')
            entity.should.have.property('foo').deepEqual([1, 2])
        })

        it('value should remain unchanged if it is not an array', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'bar'
            })
            entity.pop('foo')
            entity.should.have.property('foo').deepEqual('bar')
        })

        it('should gracefully handle empty arrays', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: []
            })
            entity.pop('foo')
            entity.should.have.property('foo').deepEqual([])
        })
    })

    describe('shift()', function () {
        it('should remove the first value of an existing array', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: [1, 2, 3]
            })
            entity.shift('foo')
            entity.should.have.property('foo').deepEqual([2, 3])
        })

        it('value should remain unchanged if it is not an array', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: 'bar'
            })
            entity.shift('foo')
            entity.should.have.property('foo').deepEqual('bar')
        })

        it('should gracefully handle empty arrays', function () {
            var entity = new UsergridEntity({
                type: 'cat',
                name: 'Cosmo',
                foo: []
            })
            entity.shift('foo')
            entity.should.have.property('foo').deepEqual([])
        })
    })

    var now = Date.now()
    var entity = new UsergridEntity({type: config.test.collection, name: 'Cosmo'})

    describe('save()', function() {
        it('should POST an entity without a uuid', function(done) {
            entity.save(client, function(response){
                response.entity.should.have.property('uuid')
                done()
            })
        })
        it('should PUT an entity without a uuid', function(done) {
            entity.putProperty('saveTest',now)
            entity.save(client, function(response){
                response.entity.should.have.property('saveTest').equal(now)
                done()
            })
        })
    })

    describe('reload()', function() {
        it('should refresh an entity with the latest server copy of itself', function(done) {
            var modified = entity.modified
            entity.putProperty('reloadTest', now)
            client.PUT(entity, function(putResponse) {
                entity.modified.should.equal(modified)
                entity.reload(client, function(reloadResponse) {
                    entity.reloadTest.should.equal(now)
                    entity.modified.should.not.equal(modified)
                    done()
                })
            })
        })
    })

    describe('remove()', function() {

        it('should remove an entity from the server', function(done) {
            entity.remove(client, function(deleteResponse) {
                deleteResponse.ok.should.be.true()
                // best practice is to destroy the 'entity' instance here, because it no longer exists on the server
                entity = null
                done()
            })
        })
    })

    describe('connect()', function() {

        var response,
            entity1,
            entity2,
            query = new UsergridQuery(config.test.collection).eq('name', 'testEntityConnectOne').or.eq('name', 'testEntityConnectTwo').asc('name')

        before(function(done) {
            // Create the entities we're going to use for connections
            client.POST({type:config.test.collection, body:[{
                "name": "testEntityConnectOne"
            }, {
                "name": "testEntityConnectTwo"
            }]}, function() {
                client.GET(query, function(usergridResponse) {
                    response = usergridResponse
                    entity1 = response.first
                    entity2 = response.last
                    done()
                })
            })
        })

        it('should connect entities by passing a target UsergridEntity object as a parameter', function(done) {
            var relationship = "foos"

            entity1.connect(client, relationship, entity2, function(usergridResponse) {
                usergridResponse.ok.should.be.true()
                client.getConnections(UsergridDirection.OUT, entity1, relationship, function(usergridResponse) {
                    usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                        "",
                        config.test.collection,
                        entity1.uuid,
                        relationship,
                        entity2.uuid,
                        "connecting",
                        relationship
                    ))
                    done()
                })
            })
        })

        it('should connect entities by passing target uuid as a parameter', function(done) {
            var relationship = "bars"

            entity1.connect(client, relationship, entity2.uuid, function(usergridResponse) {
                usergridResponse.ok.should.be.true()
                client.getConnections(UsergridDirection.OUT, entity1, relationship, function(usergridResponse) {
                    usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                        "",
                        config.test.collection,
                        entity1.uuid,
                        relationship,
                        entity2.uuid,
                        "connecting",
                        relationship
                    ))
                    done()
                })
            })
        })

        it('should connect entities by passing target type and name as parameters', function(done) {
            var relationship = "bazzes"

            entity1.connect(client, relationship, entity2.type, entity2.name, function(usergridResponse) {
                usergridResponse.ok.should.be.true()
                client.getConnections(UsergridDirection.OUT, entity1, relationship, function(usergridResponse) {
                    usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                        "",
                        config.test.collection,
                        entity1.uuid,
                        relationship,
                        entity2.uuid,
                        "connecting",
                        relationship
                    ))
                    done()
                })
            })
        })

        it('should fail to connect entities when specifying target name without type', function() {
            should(function() {
                entity1.connect("fails", 'badName', function() {})
            }).throw()
        })
    })

    describe('getConnections()', function() {

        var response,
            query = new UsergridQuery(config.test.collection).eq('name', 'testEntityConnectOne').or.eq('name', 'testEntityConnectTwo').asc('name')

        before(function(done) {
            client.GET(query, function(usergridResponse) {
                response = usergridResponse
                done()
            })
        })

        it('should get an entity\'s outbound connections', function(done) {
            var entity1 = response.first
            var entity2 = response.last

            var relationship = "foos"

            entity1.getConnections(client, UsergridDirection.OUT, relationship, function(usergridResponse) {
                usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                    "",
                    config.test.collection,
                    entity1.uuid,
                    relationship,
                    entity2.uuid,
                    "connecting",
                    relationship
                ))
                done()
            })
        })

        it('should get an entity\'s inbound connections', function(done) {
            var entity1 = response.first
            var entity2 = response.last

            var relationship = "foos"

            entity2.getConnections(client, UsergridDirection.IN, relationship, function(usergridResponse) {
                usergridResponse.first.metadata.connections[relationship].should.equal(UsergridHelpers.urljoin(
                    "",
                    config.test.collection,
                    entity2.uuid,
                    "connecting",
                    entity1.uuid,
                    relationship
                ))
                done()
            })
        })
    })

    describe('disconnect()', function() {

        var response,
            entity1,
            entity2,
            query = new UsergridQuery(config.test.collection).eq('name', 'testEntityConnectOne').or.eq('name', 'testEntityConnectTwo').asc('name')

        before(function(done) {
            client.GET(query, function(usergridResponse) {
                response = usergridResponse
                entity1 = response.first
                entity2 = response.last
                done()
            })
        })
        after(function(done) {
            var deleteQuery = new UsergridQuery(config.test.collection).eq('uuid', entity1.uuid).or.eq('uuid', entity2.uuid)
            client.DELETE(deleteQuery, function (delResponse) {
                delResponse.entities.should.be.an.Array().with.lengthOf(2)
                done()
            })
        })

        it('should disconnect entities by passing a target UsergridEntity object as a parameter', function(done) {
            var relationship = "foos"
            entity1.disconnect(client, relationship, entity2, function(usergridResponse) {
                usergridResponse.ok.should.be.true()
                client.getConnections(UsergridDirection.OUT, entity1, relationship, function(usergridResponse) {
                    usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                    done()
                })
            })
        })

        it('should disconnect entities by passing target uuid as a parameter', function(done) {
            var relationship = "bars"
            entity1.disconnect(client, relationship, entity2.uuid, function(usergridResponse) {
                usergridResponse.ok.should.be.true()
                client.getConnections(UsergridDirection.OUT, entity1, relationship, function(usergridResponse) {
                    usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                    done()
                })
            })
        })

        it('should disconnect entities by passing target type and name as parameters', function(done) {
            var relationship = "bazzes"
            entity1.disconnect(client, relationship, entity2.type, entity2.name, function(usergridResponse) {
                usergridResponse.ok.should.be.true()
                client.getConnections(UsergridDirection.OUT, entity1, relationship, function(usergridResponse) {
                    usergridResponse.entities.should.be.an.Array().with.lengthOf(0)
                    done()
                })
            })
        })

        it('should fail to disconnect entities when specifying target name without type', function() {
            should(function() {
                entity1.disconnect("fails", entity2.name, function() {})
            }).throw()
        })
    })

    var assetEntity = new UsergridEntity({type: config.test.collection, name: "attachAssetTest"})

    describe('attachAsset() and uploadAsset()', function(done) {

        var asset

        before(function (done) {
            assetEntity.save(client, function(response){
                response.ok.should.be.true()
                assetEntity.should.have.property('uuid')
                done()
            })
        })

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

        it('should attach a UsergridAsset to the entity', function(done) {
            assetEntity.attachAsset(asset)
            assetEntity.should.have.property('asset').equal(asset)
            done()
        })

        it('should upload an image asset to the remote entity', function(done) {
            assetEntity.uploadAsset(client, function(asset, usergridResponse, entity) {
                entity.should.have.property('file-metadata')
                entity['file-metadata'].should.have.property('content-length').equal(expectedContentLength)
                entity['file-metadata'].should.have.property('content-type').equal(expectedContentType)
                done()
            })
        })
    })

    describe('downloadAsset()', function(done) {

        it('should download a an image from the remote entity', function(done) {
            assetEntity.downloadAsset(client, function(asset, usergridResponse, entityWithAsset) {
                entityWithAsset.should.have.property('asset').which.is.an.instanceof(UsergridAsset)
                entityWithAsset.asset.should.have.property('contentType').equal(assetEntity['file-metadata']['content-type'])
                entityWithAsset.asset.should.have.property('contentLength').equal(assetEntity['file-metadata']['content-length'])
                // clean up the now un-needed asset entity
                entityWithAsset.remove(client)
                done()
            })
        })
    })
})