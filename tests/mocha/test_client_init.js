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

describe('Client Initialization', function() {
    it('should fail to initialize without an orgId and appId', function() {
        should(function() {
            var client = new UsergridClient(null, null);
            client.GET()
        }).throw()
    });

    // it('should initialize using properties defined in config.json', function() {
    //     var client = new UsergridClient()
    //     client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal(config.orgId)
    //     client.should.have.property('appId').equal(config.appId)
    // })

    it('should initialize when passing orgId and appId as arguments, taking precedence over config', function() {
        var client = new UsergridClient('foo', 'bar');
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal('foo');
        client.should.have.property('appId').equal('bar')
    });

    it('should initialize when passing an object containing orgId and appId, taking precedence over config', function() {
        var client = new UsergridClient({
            orgId: 'foo',
            appId: 'bar',
            baseUrl: 'https://sdk-example-test.apigee.net/appservices'
        });
        client.should.be.an.instanceof(UsergridClient).with.property('orgId').equal('foo');
        client.should.have.property('appId').equal('bar');
        client.should.have.property('baseUrl').equal('https://sdk-example-test.apigee.net/appservices')
    })
});