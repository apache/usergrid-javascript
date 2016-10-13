'use strict';

configs.forEach(function(config) {

    var client = new UsergridClient(config);

    describe('Client Connections ' + config.target, function () {
        this.timeout(_timeout);
        this.slow(_slow);

        var response,
            entity1,
            entity2;

        before(function (done) {
            // Create the entities we're going to use for connections
            client.POST({
                type: config.test.collection,
                body: [{"name": "testClientConnectOne"}, {"name": "testClientConnectTwo"}]
            }, function (postResponse) {
                response = postResponse;
                entity1 = response.first;
                entity2 = response.last;
                done()
            })
        });

        after(function (done) {
            // Delete the entities we used for connections
            _.forEach(response.entities, function (entity) {
                entity.remove(client)
            });
            done()
        });

        describe('connect()', function () {

            it('should connect entities by passing UsergridEntity objects as parameters', function (done) {
                var relationship = "foos";

                client.connect(entity1, relationship, entity2, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                            "/",
                            config.test.collection,
                            entity1.uuid,
                            relationship,
                            entity2.uuid,
                            "connecting",
                            relationship
                        ));
                        done()
                    })
                })
            });

            it('should connect entities by passing a source UsergridEntity object and a target uuid', function (done) {
                var relationship = "bars";

                client.connect(entity1, relationship, entity2.uuid, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                            "/",
                            config.test.collection,
                            entity1.uuid,
                            relationship,
                            entity2.uuid,
                            "connecting",
                            relationship
                        ));
                        done()
                    })
                })
            });

            it('should connect entities by passing source type, source uuid, and target uuid as parameters', function (done) {
                var relationship = "bazzes";

                client.connect(entity1.type, entity1.uuid, relationship, entity2.uuid, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                            "/",
                            config.test.collection,
                            entity1.uuid,
                            relationship,
                            entity2.uuid,
                            "connecting",
                            relationship
                        ));
                        done()
                    })
                })
            });

            it('should connect entities by passing source type, source name, target type, and target name as parameters', function (done) {
                var relationship = "quxes";

                client.connect(entity1.type, entity1.name, relationship, entity2.type, entity2.name, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                            "/",
                            config.test.collection,
                            entity1.uuid,
                            relationship,
                            entity2.uuid,
                            "connecting",
                            relationship
                        ));
                        done()
                    })
                })
            });

            it('should connect entities by passing a preconfigured options object', function (done) {
                var options = {
                    entity: entity1,
                    relationship: "quuxes",
                    to: entity2
                };

                client.connect(options, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, options.relationship, function (usergridResponse) {
                        usergridResponse.first.metadata.connecting[options.relationship].should.equal(UsergridHelpers.urljoin(
                            "/",
                            config.test.collection,
                            entity1.uuid,
                            options.relationship,
                            entity2.uuid,
                            "connecting",
                            options.relationship
                        ));
                        done()
                    })
                })
            });

            it('should fail to connect entities when specifying target name without type', function () {
                should(function () {
                    client.connect(entity1.type, entity1.name, "fails", 'badName', function () {
                    })
                }).throw()
            })
        });

        describe('getConnections()', function () {

            it('should get an entity\'s outbound connections', function (done) {

                var relationship = "foos";

                client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                    usergridResponse.first.metadata.connecting[relationship].should.equal(UsergridHelpers.urljoin(
                        "/",
                        config.test.collection,
                        entity1.uuid,
                        relationship,
                        entity2.uuid,
                        "connecting",
                        relationship
                    ));
                    done()
                })
            });

            it('should get an entity\'s inbound connections', function (done) {

                var relationship = "foos";

                client.getConnections(UsergridDirection.IN, entity2, relationship, function (usergridResponse) {
                    usergridResponse.first.metadata.connections[relationship].should.equal(UsergridHelpers.urljoin(
                        "/",
                        config.test.collection,
                        entity2.uuid,
                        "connecting",
                        entity1.uuid,
                        relationship
                    ));
                    done()
                })
            })
        });

        describe('disconnect()', function () {

            it('should disconnect entities by passing UsergridEntity objects as parameters', function (done) {

                var relationship = "foos";

                client.disconnect(entity1, relationship, entity2, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.entities.should.be.an.Array().with.lengthOf(0);
                        done()
                    })
                })
            });

            it('should disconnect entities by passing source type, source uuid, and target uuid as parameters', function (done) {

                var relationship = "bars";

                client.disconnect(entity1.type, entity1.uuid, relationship, entity2.uuid, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.entities.should.be.an.Array().with.lengthOf(0);
                        done()
                    })
                })
            });

            it('should disconnect entities by passing source type, source name, target type, and target name as parameters', function (done) {

                var relationship = "bazzes";

                client.disconnect(entity1.type, entity1.name, relationship, entity2.type, entity2.name, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, relationship, function (usergridResponse) {
                        usergridResponse.entities.should.be.an.Array().with.lengthOf(0);
                        done()
                    })
                })
            });

            it('should disconnect entities by passing a preconfigured options object', function (done) {

                var options = {
                    entity: entity1,
                    relationship: "quxes",
                    to: entity2
                };

                client.disconnect(options, function (usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    client.getConnections(UsergridDirection.OUT, entity1, options.relationship, function (usergridResponse) {
                        usergridResponse.entities.should.be.an.Array().with.lengthOf(0);
                        done()
                    })
                })
            });

            it('should fail to disconnect entities when specifying target name without type', function () {

                should(function () {
                    client.disconnect(entity1.type, entity1.name, "fails", entity2.name, function () {
                    })
                }).throw()
            })
        })
    })
});