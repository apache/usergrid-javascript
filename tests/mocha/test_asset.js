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

    describe('UsergridAsset ' + config.target, function () {
        this.timeout(_timeout);
        this.slow(_slow);

        var asset;

        before(function (done) {
            var req = new XMLHttpRequest();
            req.open('GET', testFile.uri, true);
            req.responseType = 'blob';
            req.onload = function () {
                asset = new UsergridAsset(req.response);
                done();
            };
            req.onerror = function (err) {
                console.error(err);
                done();
            };
            req.send(null);
        });

        describe('init from XMLHTTPRequest', function () {

            it('asset.data should be a Javascript Blob', function () {
                asset.data.should.be.an.instanceOf(Blob)
            });

            it('asset.contentType should be inferred from Blob', function () {
                asset.contentType.should.equal(testFile.contentType)
            });

            it('asset.contentLength should be ' + testFile.contentLength + ' bytes', function () {
                asset.contentLength.should.equal(testFile.contentLength)
            })
        });

        describe('upload via UsergridClient.uploadAsset() to a specific entity', function () {
            var entity = new UsergridEntity({
                type: config.test.collection,
                name: "TestClientUploadAsset"
            });

            before(function (done) {
                entity.save(client, function (error,response) {
                    response.ok.should.be.true();
                    entity.should.have.property('uuid');
                    done()
                })
            });
            after(function (done) {
                entity.remove(client, function (error,response) {
                    response.ok.should.be.true();
                    entity.uuid.should.be.equal(response.entity.uuid);
                    entity.name.should.be.equal(response.entity.name);
                    done()
                })
            });
            it('should upload a binary asset to an entity', function (done) {
                client.uploadAsset(entity, asset, function (error, assetResponse, entityWithAsset) {
                    assetResponse.statusCode.should.equal(200);
                    entityWithAsset.uuid.should.be.equal(entity.uuid);
                    entityWithAsset.name.should.be.equal(entity.name);
                    entityWithAsset.should.have.property('file-metadata');
                    entityWithAsset['file-metadata'].should.have.property('content-type').equal(testFile.contentType);
                    entityWithAsset['file-metadata'].should.have.property('content-length').equal(testFile.contentLength);
                    done()
                })
            })
        });

        describe('upload via entity.uploadAsset() to a specific entity', function () {
            var entity = new UsergridEntity({
                type: config.test.collection,
                name: "TestEntityUploadAsset"
            });

            before(function (done) {
                entity.save(client, function (error,response) {
                    response.ok.should.be.true();
                    entity.should.have.property('uuid');
                    done()
                })
            });

            after(function (done) {

                entity.remove(client, function (error,response) {
                    response.ok.should.be.true();
                    entity.uuid.should.be.equal(response.entity.uuid);
                    entity.name.should.be.equal(response.entity.name);
                    done()
                })
            });

            it('should upload a binary asset to an existing entity', function (done) {

                entity.attachAsset(asset);
                entity.save(client, function () {
                    entity.uploadAsset(client, function (error, assetResponse, entityWithAsset) {
                        assetResponse.statusCode.should.equal(200);
                        entityWithAsset.uuid.should.be.equal(entity.uuid);
                        entityWithAsset.name.should.be.equal(entity.name);
                        entityWithAsset.should.have.property('file-metadata');
                        entityWithAsset['file-metadata'].should.have.property('content-type').equal(testFile.contentType);
                        entityWithAsset['file-metadata'].should.have.property('content-length').equal(testFile.contentLength);
                        done()
                    })
                })
            });
            it('should download a binary asset to an existing entity', function (done) {
                entity.downloadAsset(client, function (error, assetResponse, entityWithAsset) {
                    assetResponse.statusCode.should.equal(200);
                    entityWithAsset.uuid.should.be.equal(entity.uuid);
                    entityWithAsset.name.should.be.equal(entity.name);
                    entityWithAsset.should.have.property('file-metadata');
                    entityWithAsset['file-metadata'].should.have.property('content-type').equal(testFile.contentType);
                    entityWithAsset['file-metadata'].should.have.property('content-length').equal(testFile.contentLength);
                    done()
                })
            })
        })
    })
});