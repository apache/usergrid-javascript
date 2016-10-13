'use strict';

configs.forEach(function(config) {

    describe('Client Auth Tests ' + config.target, function () {
        this.timeout(_timeout);
        this.slow(_slow);

        function getClient() {
            return new UsergridClient(config);
        }

        describe('authFallback', function () {
            var token,
                client = getClient();

            before(function (done) {
                // authenticate app and remove sandbox permissions
                client.setAppAuth(config.clientId, config.clientSecret);
                client.authenticateApp(function () {
                    token = client.appAuth.token;
                    var permissionsQuery = new UsergridQuery('roles/guest/permissions').urlTerm('permission', 'get,post,put,delete:/**');
                    client.usingAuth(client.appAuth).DELETE(permissionsQuery, function () {
                        done()
                    })
                })
            });

            it('should fall back to using no authentication when currentUser is not authenticated and authFallback is set to NONE', function (done) {
                client.authMode = UsergridAuthMode.NONE;
                client.GET('users', function (error,usergridResponse) {
                    should(client.currentUser).be.undefined();
                    usergridResponse.request.headers.should.not.have.property('authorization');
                    usergridResponse.error.name.should.equal('unauthorized');
                    usergridResponse.ok.should.be.false();
                    done()
                })
            });

            it('should fall back to using the app token when currentUser is not authenticated and authFallback is set to APP', function (done) {
                client.authMode = UsergridAuthMode.APP;
                client.GET('users', function (error,usergridResponse) {
                    should(client.currentUser).be.undefined();
                    usergridResponse.request.headers.should.have.property('authorization').equal('Bearer ' + token);
                    usergridResponse.ok.should.be.true();
                    usergridResponse.user.should.be.an.instanceof(UsergridUser);
                    done()
                })
            });

            after(function (done) {
                client.authMode = UsergridAuthMode.NONE;
                client.usingAuth(client.appAuth).POST('roles/guest/permissions', {'permission': 'get,post,put,delete:/**'}, function () {
                    done()
                })
            })
        });

        describe('authenticateApp()', function () {

            var response, token, client = getClient();
            before(function (done) {
                client.setAppAuth(config.clientId, config.clientSecret);
                client.authenticateApp(function (error,usergridResponse) {
                    response = usergridResponse;
                    token = client.appAuth.token;
                    done()
                })
            });

            it('response.ok should be true', function () {
                response.ok.should.be.true()
            });

            it('should have a valid token', function () {
                token.should.be.a.String();
                token.length.should.be.greaterThan(10)
            });

            it('client.appAuth.token should be set to the token returned from Usergrid', function () {
                client.appAuth.should.have.property('token').equal(token)
            });

            it('client.appAuth.isValid should be true', function () {
                client.appAuth.should.have.property('isValid').which.is.true()
            });

            it('client.appAuth.expiry should be set to a future date', function () {
                client.appAuth.should.have.property('expiry').greaterThan(Date.now())
            });

            it('should fail when called without a clientId and clientSecret', function () {
                should(function () {
                    var client = new UsergridClient({orgId: config.orgId, appId: config.appId, baseUrl: config.baseUrl});
                    client.setAppAuth(undefined, undefined, 0);
                    client.authenticateApp()
                }).throw()
            });

            it('should authenticate by passing clientId and clientSecret in an object', function (done) {
                var isolatedClient = new UsergridClient({
                    orgId: config.orgId,
                    appId: config.appId,
                    baseUrl: config.baseUrl
                });
                isolatedClient.authenticateApp({
                    clientId: config.clientId,
                    clientSecret: config.clientSecret
                }, function () {
                    isolatedClient.appAuth.should.have.property('token');
                    done()
                })
            });

            it('should authenticate by passing a UsergridAppAuth instance with a custom ttl', function (done) {
                var isolatedClient = new UsergridClient({
                    orgId: config.orgId,
                    appId: config.appId,
                    baseUrl: config.baseUrl
                });
                var ttlInMilliseconds = 500000;
                var appAuth = new UsergridAppAuth(config.clientId, config.clientSecret, ttlInMilliseconds);
                isolatedClient.authenticateApp(appAuth, function (error,response) {
                    isolatedClient.appAuth.should.have.property('token');
                    response.responseJSON.expires_in.should.equal(ttlInMilliseconds / 1000);
                    done()
                })
            });

            it('should not set client.appAuth when authenticating with a bad clientId and clientSecret in an object', function (done) {
                var failClient = new UsergridClient({orgId: config.orgId, appId: config.appId, baseUrl: config.baseUrl});
                failClient.authenticateApp({
                    clientId: 'BADCLIENTID',
                    clientSecret: 'BADCLIENTSECRET'
                }, function (error,response) {
                    error.should.containDeep({
                        name: 'invalid_grant',
                        description: 'invalid username or password'
                    });
                    should(failClient.appAuth).be.undefined();
                    done()
                })
            });

            it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using an object)', function (done) {
                var failClient = new UsergridClient({orgId: config.orgId, appId: config.appId, baseUrl: config.baseUrl});
                failClient.authenticateApp(new UsergridAppAuth({
                    clientId: 'BADCLIENTID',
                    clientSecret: 'BADCLIENTSECRET'
                }), function (error,response) {
                    error.should.containDeep({
                        name: 'invalid_grant',
                        description: 'invalid username or password'
                    });
                    should(failClient.appAuth).be.undefined();
                    done()
                })
            });


            it('should not set client.appAuth when authenticating with a bad UsergridAppAuth instance (using arguments)', function (done) {
                var failClient = new UsergridClient({orgId: config.orgId, appId: config.appId, baseUrl: config.baseUrl});
                failClient.authenticateApp(new UsergridAppAuth('BADCLIENTID', 'BADCLIENTSECRET'), function (error,response) {
                    error.should.containDeep({
                        name: 'invalid_grant',
                        description: 'invalid username or password'
                    });
                    should(failClient.appAuth).be.undefined();
                    done()
                })
            })
        });

        describe('authenticateUser()', function () {

            var response, token, email = randomWord() + '@' + randomWord() + '.com';
            var client = getClient();
            before(function (done) {
                client.authenticateUser({
                    username: config.test.username,
                    password: config.test.password,
                    email: email
                }, function (error, usergridResponse, authToken) {
                    response = usergridResponse;
                    token = authToken
                    done()
                })
            });

            it('should fail when called without a email (or username) and password', function () {
                should(function () {
                    var badClient = new UsergridClient({
                        orgId: config.orgId,
                        appId: config.appId,
                        baseUrl: config.baseUrl
                    });
                    badClient.authenticateUser({})
                }).throw()
            });

            it('response.ok should be true', function () {
                response.ok.should.be.true()
            });

            it('should have a valid token', function () {
                token.should.be.a.String();
                token.length.should.be.greaterThan(10)
            });

            it('client.currentUser.auth.token should be set to the token returned from Usergrid', function () {
                client.currentUser.auth.should.have.property('token').equal(token)
            });

            it('client.currentUser.auth.isValid should be true', function () {
                client.currentUser.auth.should.have.property('isValid').which.is.true()
            });

            it('client.currentUser.auth.expiry should be set to a future date', function () {
                client.currentUser.auth.should.have.property('expiry').greaterThan(Date.now())
            });

            it('client.currentUser should have a username and email', function () {
                client.currentUser.should.have.property('username');
                client.currentUser.should.have.property('email').equal(email)
            });

            it('client.currentUser and client.currentUser.auth should not store password', function () {
                client.currentUser.should.not.have.property('password');
                client.currentUser.auth.should.not.have.property('password')
            });

            it('should support an optional bool to not set as current user', function (done) {
                var noCurrentUserClient = new UsergridClient({
                    orgId: config.orgId,
                    appId: config.appId,
                    baseUrl: config.baseUrl
                });
                noCurrentUserClient.authenticateUser({
                    username: config.test.username,
                    password: config.test.password,
                    email: config.test.email
                }, false, function (error,response) {
                    should(noCurrentUserClient.currentUser).be.undefined();
                    done()
                })
            });

            it('should support passing a UsergridUserAuth instance with a custom ttl', function (done) {
                var newClient = new UsergridClient({orgId: config.orgId, appId: config.appId, baseUrl: config.baseUrl});
                var ttlInMilliseconds = 500000;
                var userAuth = new UsergridUserAuth(config.test.username, config.test.password, ttlInMilliseconds);
                newClient.authenticateUser(userAuth, function (error, usergridResponse, authToken) {
                    usergridResponse.ok.should.be.true();
                    newClient.currentUser.auth.token.should.equal(authToken);
                    usergridResponse.responseJSON.expires_in.should.equal(ttlInMilliseconds / 1000);
                    done()
                })
            })
        });

        describe('appAuth, setAppAuth()', function () {
            var client = getClient();
            it('should initialize by passing a list of arguments', function () {
                client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl);
                client.appAuth.should.be.instanceof(UsergridAppAuth)
            });

            it('should be a subclass of UsergridAuth', function () {
                client.setAppAuth(config.clientId, config.clientSecret, config.tokenTtl);
                client.appAuth.should.be.instanceof(UsergridAuth)
            });

            it('should initialize by passing an object', function () {
                client.setAppAuth({
                    clientId: config.clientId,
                    clientSecret: config.clientSecret,
                    tokenTtl: config.tokenTtl
                });
                client.appAuth.should.be.instanceof(UsergridAppAuth)
            });

            it('should initialize by passing an instance of UsergridAppAuth', function () {
                client.setAppAuth(new UsergridAppAuth(config.clientId, config.clientSecret, config.tokenTtl));
                client.appAuth.should.be.instanceof(UsergridAppAuth)
            });

            it('should initialize by setting to an instance of UsergridAppAuth', function () {
                client.appAuth = new UsergridAppAuth(config.clientId, config.clientSecret, config.tokenTtl);
                client.appAuth.should.be.instanceof(UsergridAppAuth)
            })
        });

        describe('usingAuth()', function () {

            var client = getClient(),
                authFromToken;

            before(function (done) {
                client.authenticateUser({
                    username: config.test.username,
                    password: config.test.password
                }, function (error, response, token) {
                    authFromToken = new UsergridAuth(token);
                    done()
                })
            });

            it('should authenticate using an ad-hoc token', function (done) {
                authFromToken.isValid.should.be.true();
                authFromToken.should.have.property('token');
                client.usingAuth(authFromToken).GET('/users/me', function (error,usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    usergridResponse.should.have.property('user').which.is.an.instanceof(UsergridUser);
                    usergridResponse.user.should.have.property('uuid');
                    done()
                })
            });

            it('client.tempAuth should be destroyed after making a request with ad-hoc authentication', function (done) {
                should(client.tempAuth).be.undefined();
                done()
            });

            it('should send an unauthenticated request when UsergridAuth.NO_AUTH is passed to .usingAuth()', function (done) {
                client.authMode = UsergridAuthMode.NONE;
                client.GET('/users/me', function (error,usergridResponse) {
                    usergridResponse.ok.should.be.false();
                    usergridResponse.request.headers.should.not.have.property('authentication');
                    usergridResponse.should.not.have.property('user');
                    done()
                })
            });

            it('should send an unauthenticated request when no arguments are passed to .usingAuth()', function (done) {
                client.usingAuth().GET('/users/me', function (error,usergridResponse) {
                    usergridResponse.ok.should.be.false();
                    usergridResponse.request.headers.should.not.have.property('authentication');
                    usergridResponse.should.not.have.property('user');
                    done()
                })
            })
        })
    })
});