module.exports = function(grunt) {
	var files = [
        "lib/modules/util/Promise.js",
        "lib/modules/util/lodash.js",
        "lib/modules/UsergridEnums.js",
        "lib/modules/util/UsergridHelpers.js",
        "lib/modules/UsergridClient.js",
        "lib/Usergrid.js",
        "lib/modules/UsergridQuery.js",
        "lib/modules/UsergridRequest.js",
        "lib/modules/UsergridAuth.js",
        "lib/modules/UsergridEntity.js",
        "lib/modules/UsergridUser.js",
        "lib/modules/UsergridResponse.js",
        "lib/modules/UsergridAsset.js"
    ];
    var banner = "/*! \n\
 *Licensed to the Apache Software Foundation (ASF) under one\n\
 *or more contributor license agreements.  See the NOTICE file\n\
 *distributed with this work for additional information\n\
 *regarding copyright ownership.  The ASF licenses this file\n\
 *to you under the Apache License, Version 2.0 (the\n\
 *\"License\"); you may not use this file except in compliance\n\
 *with the License.  You may obtain a copy of the License at\n\
 *\n\
 *  http://www.apache.org/licenses/LICENSE-2.0\n\
 * \n\
 *Unless required by applicable law or agreed to in writing,\n\
 *software distributed under the License is distributed on an\n\
 *\"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n\
 *KIND, either express or implied.  See the License for the\n\
 *specific language governing permissions and limitations\n\
 *under the License.\n\
 * \n\
 * \n\
 * <%= meta.package.name %>@<%= meta.package.version %> <%= grunt.template.today('yyyy-mm-dd') %> \n\
 */\n";

	// Project configuration.
	grunt.initConfig({
        "meta": { "package": grunt.file.readJSON("package.json") },
        "clean": ["usergrid.js", "usergrid.min.js"],
        "uglify": {
            "unminified": {
                "options": {
                    "banner": banner,
                    "mangle": false,
                    "beautify": true,
                    "compress": false,
                    "preserveComments": "some"
                },
                "files": { "usergrid.js": files }
            },
            "minified": {
                "options": {
                    "banner": banner,
                    "mangle": false,
                    "beautify": false,
                    "compress": {},
                    "preserveComments": "some"
                },
                "files": { "usergrid.min.js": files }
            }
        },
        "connect": {
            "server": {
                "options": {
                    "port": 3000,
                    "base": "."
                }
            },
            "test": {
                "options": {
                    "port": 8000,
                    "base": "."
                }
            }
        },
        "watch": {
            "files": [files, 'Gruntfile.js'],
            "tasks": ["default"]
        },
        "mocha": {
            "test": {
                "options": {
                    "urls": [ 'http://localhost:<%= connect.test.options.port %>/tests/mocha/index.html' ],
                    "reporter": "Spec",
                    "threshold": 70,
                    "run":true
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-mocha");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("should");
	grunt.registerTask("default", [
		"clean",
		"uglify"
	]);
	grunt.registerTask("dev", [
		"connect:server",
		"watch"
	]);
	grunt.registerTask("test", [
		"connect:test",
		"mocha:test"
	]);
};
