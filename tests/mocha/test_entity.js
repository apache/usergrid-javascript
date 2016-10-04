
function getClient() {
    return Usergrid.initSharedInstance({
        orgId: 'rwalsh',
        appId: 'sandbox'
    });
}

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

    describe('reload()', function() {
        it('should refresh an entity with the latest server copy of itself', function(done) {
            var client = getClient(),
                now = Date.now()
            client.GET("nodejs", function(getResponse) {
                var entity = new UsergridEntity(getResponse.first)
                var modified = entity.modified
                getResponse.first.putProperty('reloadTest', now)
                client.PUT(getResponse.first, function(putResponse) {
                    entity.reload(client, function() {
                        client.isSharedInstance.should.be.false()
                        entity.reloadTest.should.equal(now)
                        entity.modified.should.not.equal(modified)
                        done()
                    })
                })
            })
        })
    })

    describe('save()', function() {

        it('should save an updated entity to the server', function(done) {
            var client = getClient(),
                now = Date.now()
            client.GET(config.test.collection, function(getResponse) {
                var entity = new UsergridEntity(getResponse.first)
                entity.putProperty('saveTest', now)
                entity.save(client, function() {
                    client.isSharedInstance.should.be.false()
                    entity.saveTest.should.equal(now)
                    done()
                })
            })
        })
    })
})