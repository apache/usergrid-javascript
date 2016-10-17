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

"use strict";

var UsergridAssetDefaultFileName = "file";

var UsergridAsset = function(fileOrBlob) {
    if( !fileOrBlob instanceof File || !fileOrBlob instanceof Blob ) {
        throw new Error("UsergridAsset must be initialized with a 'File' or 'Blob'");
    }
    var self = this;
    self.data = fileOrBlob;
    self.filename = fileOrBlob.name || UsergridAssetDefaultFileName;
    self.contentLength = fileOrBlob.size;
    self.contentType = fileOrBlob.type;
    return self;
};