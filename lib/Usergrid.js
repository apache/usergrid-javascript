/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//Hack around IE console.log
window.console = window.console || {};
window.console.log = window.console.log || function() {};

'use strict'

var UsergridClientSharedInstance = function() {
    var self = this
    self.isInitialized = false
    self.isSharedInstance = true
    return self
}
UsergridHelpers.inherits(UsergridClientSharedInstance, UsergridClient)

var Usergrid = new UsergridClientSharedInstance()
Usergrid.initSharedInstance = function(options) {
    if (Usergrid.isInitialized) {
        console.log('Usergrid shared instance is already initialized')
    } else {
        _.assign(Usergrid, new UsergridClient(options))
        Usergrid.isInitialized = true
        Usergrid.isSharedInstance = true
    }
    return Usergrid
}
Usergrid.init = function(options) { return Usergrid.initSharedInstance(options) }
