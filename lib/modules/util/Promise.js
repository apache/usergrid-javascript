/*
 *Licensed to the Apache Software Foundation (ASF) under one
 *or more contributor license agreements.  See the NOTICE file
 *distributed with this work for additional information
 *regarding copyright ownership.  The ASF licenses this file
 *to you under the Apache License, Version 2.0 (the
 *"License"); you may not use this file except in compliance
 *with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0

 *Unless required by applicable law or agreed to in writing,
 *software distributed under the License is distributed on an
 *"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *KIND, either express or implied.  See the License for the
 *specific language governing permissions and limitations
 *under the License.
 *
 *  @author ryan bridges (rbridges@apigee.com)
 */

"use strict";

(function(global) {
    var name = "Promise", overwrittenName = global[name];

        function Promise() {
            this.complete = false;
            this.result = null;
            this.callbacks = [];
        }
        Promise.prototype.then = function(callback, context) {
            var f = function() {
                return callback.apply(context, arguments);
            };
            if (this.complete) {
                f(this.result);
            } else {
                this.callbacks.push(f);
            }
        };
        Promise.prototype.done = function(result) {
            this.complete = true;
            this.result = result;
            if(this.callbacks){
                _.forEach(this.callbacks,function(callback){
                    callback(result);
                });
                this.callbacks.length = 0;
            }
        };
        Promise.join = function(promises) {
            var p = new Promise(),
                total = promises.length,
                completed = 0,
                results = [];

            function notifier(i) {
                return function(result) {
                    completed += 1;
                    results[i] = result;
                    if (completed === total) {
                        p.done(results);
                    }
                };
            }
            for (var i = 0; i < total; i++) {
                promises[i]().then(notifier(i));
            }
            return p;
        };
        Promise.chain = function(promises, result) {
            var p = new Promise();
            if (promises===null||promises.length === 0) {
                p.done(result);
            } else {
                promises[0](result).then(function(res) {
                    promises.splice(0, 1);
                    if(promises){
                        Promise.chain(promises, res).then(function(r) {
                            p.done(r);
                        });
                    }else{
                        p.done(res);
                    }
                });
            }
            return p;
        };

    global[name] =  Promise;
    global[name].noConflict = function() {
        if(overwrittenName){
            global[name] = overwrittenName;
        }
        return Promise;
    };
    return global[name];
}(this));
