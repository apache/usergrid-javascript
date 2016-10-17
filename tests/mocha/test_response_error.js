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

    describe('UsergridResponseError ' + config.target, function () {
        this.timeout(_timeout);
        this.slow(_slow);

        var _response;

        describe('name, description, exception', function () {

            before(function (done) {
                client.GET(config.test.collection, 'BADNAMEORUUID', function (error,usergridResponse) {
                    _response = usergridResponse;
                    done()
                })
            });

            it('response.statusCode should be greater than or equal to 400', function () {
                _response.ok.should.be.false()
            });

            it('response.error should be a UsergridResponseError object with name, description, and exception keys', function () {
                _response.ok.should.be.false();
                _response.error.should.be.an.instanceof(UsergridResponseError).with.properties(['name', 'description', 'exception'])
            })
        });

        describe('undefined check', function () {
            it('response.error should be undefined on a successful response', function (done) {
                client.GET(config.test.collection, function (error,usergridResponse) {
                    usergridResponse.ok.should.be.true();
                    should(usergridResponse.error).be.undefined();
                    done()
                })
            })
        })
    })
});