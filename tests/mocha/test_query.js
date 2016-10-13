//
// Licensed to the Apache Software Foundation (ASF) under one or more
// contributor license agreements.  See the NOTICE file distributed with
// this work for additional information regarding copyright ownership.
// The ASF licenses this file to You under the Apache License, Version 2.0
// (the "License"); you may not use this file except in compliance with
// the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

describe('UsergridQuery', function() {

    describe('_type', function() {
        it('_type should equal "cats" when passing "type" as a parameter to UsergridQuery', function() {
            var query = new UsergridQuery('cats');
            query.should.have.property('_type').equal('cats')
        });

        it('_type should equal "cats" when calling .type() builder method', function() {
            var query = new UsergridQuery().type('cats');
            query.should.have.property('_type').equal('cats')
        });

        it('_type should equal "cats" when calling .collection() builder method', function() {
            var query = new UsergridQuery().collection('cats');
            query.should.have.property('_type').equal('cats')
        })
    });

    describe('_limit', function() {
        it('_limit should equal 2 when setting .limit(2)', function() {
            var query = new UsergridQuery('cats').limit(2);
            query.should.have.property('_limit').equal(2)
        });

        it('_limit should equal 10 when setting .limit(10)', function() {
            var query = new UsergridQuery('cats').limit(10);
            query.should.have.property('_limit').equal(10)
        })
    });

    describe('_ql', function() {
        it('should be an select all if query or sort are empty or underfined', function() {
            var query = new UsergridQuery('cats');
            query.should.have.property('_ql').equal("select * ")
        });

        it('should support complex builder pattern syntax (chained constructor methods)', function() {
            var query = new UsergridQuery('cats')
                .gt('weight', 2.4)
                .contains('color', 'bl*')
                .not
                .eq('color', 'blue')
                .or
                .eq('color', 'orange');
            query.should.have.property('_ql').equal("select * where weight > 2.4 and color contains 'bl*' and not color = 'blue' or color = 'orange'")
        });

        it('and operator should be implied when joining multiple conditions', function() {
            var query1 = new UsergridQuery('cats')
                .gt('weight', 2.4)
                .contains('color', 'bl*');
            query1.should.have.property('_ql').equal("select * where weight > 2.4 and color contains 'bl*'");
            var query2 = new UsergridQuery('cats')
                .gt('weight', 2.4)
                .and
                .contains('color', 'bl*');
            query2.should.have.property('_ql').equal("select * where weight > 2.4 and color contains 'bl*'")
        });

        it('not operator should precede conditional statement', function() {
            var query = new UsergridQuery('cats')
                .not
                .eq('color', 'white');
            query.should.have.property('_ql').equal("select * where not color = 'white'")
        });

        it('fromString should set _ql directly, bypassing builder pattern methods', function() {
            var q = "where color = 'black' or color = 'orange'";
            var query = new UsergridQuery('cats')
                .fromString(q);
            query.should.have.property('_ql').equal(q)
        });

        it('string values should be contained in single quotes', function() {
            var query = new UsergridQuery('cats')
                .eq('color', 'black');
            query.should.have.property('_ql').equal("select * where color = 'black'")
        });

        it('boolean values should not be contained in single quotes', function() {
            var query = new UsergridQuery('cats')
                .eq('longHair', true);
            query.should.have.property('_ql').equal("select * where longHair = true")
        });

        it('float values should not be contained in single quotes', function() {
            var query = new UsergridQuery('cats')
                .lt('weight', 18);
            query.should.have.property('_ql').equal("select * where weight < 18")
        });

        it('integer values should not be contained in single quotes', function() {
            var query = new UsergridQuery('cats')
                .gte('weight', 2);
            query.should.have.property('_ql').equal("select * where weight >= 2")
        });

        it('uuid values should not be contained in single quotes', function() {
            var query = new UsergridQuery('cats')
                .eq('uuid', 'a61e29ba-944f-11e5-8690-fbb14f62c803');
            query.should.have.property('_ql').equal("select * where uuid = a61e29ba-944f-11e5-8690-fbb14f62c803")
        })
    })
});