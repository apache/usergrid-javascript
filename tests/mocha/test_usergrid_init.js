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

    describe('Usergrid init() / initSharedInstance() ' + config.target, function () {
        it('should be an instance of UsergridClient', function (done) {
            Usergrid.init(config);
            Usergrid.initSharedInstance(config);
            Usergrid.should.be.an.instanceof(UsergridClient);
            done()
        });
        it('should be initialized when defined in another module', function (done) {
            Usergrid.should.have.property('isInitialized').which.is.true();
            Usergrid.should.have.property('isSharedInstance').which.is.true();
            done()
        })
    })
});