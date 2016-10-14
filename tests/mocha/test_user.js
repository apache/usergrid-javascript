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

configs.forEach(function(config) {

    var client = new UsergridClient(config);

    describe('UsergridUser ' + config.target, function () {
        this.timeout(_timeout);
        this.slow(_slow);

        var _username1 = randomWord(),
            _user1 = new UsergridUser({
                username: _username1,
                password: config.test.password
            });


        before(function (done) {
            var query = new UsergridQuery('users').not.eq('username', config.test.username).limit(20);
            // clean up old user entities as the UsergridResponse tests rely on this collection containing less than 10 entities
            client.DELETE(query, function () {
                _user1.create(client, function (err, usergridResponse, user) {
                    done()
                })
            })
        });

        describe('create()', function () {

            it("should create a new user with the username " + _username1, function () {
                _user1.username.should.equal(_username1)
            });

            it('should have a valid uuid', function () {
                _user1.should.have.property('uuid')//.which.is.a.uuid()
            });;

            it('should have a created date', function () {
                _user1.should.have.property('created')
            });

            it('should be activated (i.e. has a valid password)', function () {
                _user1.should.have.property('activated').true()
            });

            it('should not have a password property', function () {
                _user1.should.not.have.property('password')
            });

            it('should fail gracefully when a username already exists', function (done) {
                var user = new UsergridUser({
                    username: _username1,
                    password: config.test.password
                });
                user.create(client, function (error,usergridResponse) {
                    usergridResponse.error.should.not.be.null();
                    usergridResponse.error.should.containDeep({
                        name: 'duplicate_unique_property_exists'
                    });
                    usergridResponse.ok.should.be.false();
                    done()
                })
            });

            it('should create a new user on the server', function (done) {
                var username = randomWord();
                var user = new UsergridUser({
                    username: username,
                    password: config.test.password
                });
                user.create(client, function (error,usergridResponse) {
                    user.username.should.equal(username);
                    user.should.have.property('uuid')//.which.is.a.uuid()
                    user.should.have.property('created');
                    user.should.have.property('activated').true();
                    user.should.not.have.property('password');
                    // cleanup
                    user.remove(client, function (error,response) {
                        done()
                    })
                });
            })
        });

        describe('login()', function () {
            it("it should log in the user '" + _username1 + "' and receive a token", function (done) {
                _user1.password = config.test.password;
                _user1.login(client, function (error, response, token) {
                    _user1.auth.should.have.property('token').equal(token);
                    _user1.should.not.have.property('password');
                    _user1.auth.should.not.have.property('password');
                    done()
                })
            })
        });

        describe('logout()', function () {

            it("it should log out " + _username1 + " and destroy the saved UsergridUserAuth instance", function (done) {
                _user1.logout(client, function (error,response) {
                    response.ok.should.be.true();
                    response.responseJSON.action.should.equal("revoked user token");
                    _user1.auth.isValid.should.be.false();
                    done()
                })
            });

            it("it should return an error when attempting to log out a user that does not have a valid token", function (done) {
                _user1.logout(client, function (error,response) {
                    response.error.name.should.equal('no_valid_token');
                    done()
                })
            })
        });

        describe('logoutAllSessions()', function () {
            it("it should log out all tokens for the user " + _username1 + " destroy the saved UsergridUserAuth instance", function (done) {
                _user1.password = config.test.password;
                _user1.login(client, function (error, response, token) {
                    _user1.logoutAllSessions(client, function (error,response) {
                        response.ok.should.be.true();
                        response.responseJSON.action.should.equal("revoked user tokens");
                        _user1.auth.isValid.should.be.false();
                        done()
                    })
                })
            })
        });

        describe('resetPassword()', function () {

            it("it should reset the password for " + _username1 + " by passing parameters", function (done) {
                _user1.resetPassword(client, config.test.password, '2cool4u', function (error,response) {
                    response.ok.should.be.true();
                    response.responseJSON.action.should.equal("set user password");
                    done()
                })
            });

            it("it should reset the password for " + _username1 + " by passing an object", function (done) {
                _user1.resetPassword(client, {
                    oldPassword: '2cool4u',
                    newPassword: config.test.password
                }, function (error,response) {
                    response.ok.should.be.true();
                    response.responseJSON.action.should.equal("set user password");
                    done()
                })
            });

            it("it should not reset the password for " + _username1 + " when passing a bad old password", function (done) {
                _user1.resetPassword(client, {
                    oldPassword: 'BADOLDPASSWORD',
                    newPassword: config.test.password
                }, function (error,response) {
                    response.ok.should.be.false();
                    response.error.name.should.equal('auth_invalid_username_or_password');
                    _user1.remove(client, function () {
                        done()
                    })
                })
            });

            it("it should return an error when attempting to reset a password with missing arguments", function () {
                should(function () {
                    _user1.resetPassword(client, 'NEWPASSWORD', function () {
                    })
                }).throw()
            })
        });

        describe('CheckAvailable()', function () {

            var nonExistentEmail = randomWord() + '@' + randomWord() + '.com';
            var nonExistentUsername = randomWord();

            it("it should return true for username " + config.test.username, function (done) {
                UsergridUser.CheckAvailable(client, {
                    username: config.test.username
                }, function (error,response, exists) {
                    exists.should.be.true();
                    done()
                })
            });

            it("it should return true for email " + config.test.email, function (done) {
                UsergridUser.CheckAvailable(client, {
                    email: config.test.email
                }, function (error,response, exists) {
                    exists.should.be.true();
                    done()
                })
            });

            it("it should return true for email " + config.test.email + " and non-existent username " + nonExistentUsername, function (done) {
                UsergridUser.CheckAvailable(client, {
                    email: config.test.email,
                    username: nonExistentUsername
                }, function (error,response, exists) {
                    exists.should.be.true();
                    done()
                })
            });

            it("it should return true for non-existent email " + nonExistentEmail + " and username " + config.test.username, function (done) {
                UsergridUser.CheckAvailable(client, {
                    email: nonExistentEmail,
                    username: config.test.username
                }, function (error,response, exists) {
                    exists.should.be.true();
                    done()
                })
            });

            it("it should return true for email " + config.test.email + " and username " + config.test.username, function (done) {
                UsergridUser.CheckAvailable(client, {
                    email: config.test.email,
                    username: config.test.useranme
                }, function (error,response, exists) {
                    exists.should.be.true();
                    done()
                })
            });

            it("it should return false for non-existent email " + nonExistentEmail, function (done) {
                UsergridUser.CheckAvailable(client, {
                    email: nonExistentEmail
                }, function (error,response, exists) {
                    exists.should.be.false();
                    done()
                })
            });

            it("it should return false for non-existent username " + nonExistentUsername, function (done) {
                UsergridUser.CheckAvailable(client, {
                    username: nonExistentUsername
                }, function (error,response, exists) {
                    exists.should.be.false();
                    done()
                })
            });

            it("it should return false for non-existent email " + nonExistentEmail + " and non-existent username " + nonExistentUsername, function (done) {
                UsergridUser.CheckAvailable(client, {
                    email: nonExistentEmail,
                    username: nonExistentUsername
                }, function (error,response, exists) {
                    exists.should.be.false();
                    done()
                })
            })
        })
    })
});