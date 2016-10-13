
var targetedConfigs = {
    "1.0": {
        "orgId": "rwalsh",
        "appId": "jssdktestapp",
        "baseUrl": UsergridClientDefaultOptions.baseUrl,
        "clientId": "YXA6KPq8cIsPEea0i-W5Jx8cgw",
        "clientSecret": "YXA6WaT7qsxh_eRS3ryBresi-HwoQAQ",
        "target": "1.0",
        "test": {
            "collection": "nodejs",
            "email": "authtest@test.com",
            "password": "P@ssw0rd",
            "username": "authtest"
        }
    },
    "2.1": {
        "orgId": "api-connectors",
        "appId": "sdksandbox",
        "baseUrl": "https://api-connectors-prod.apigee.net/appservices",
        "clientId": "YXA6WMhAuFJTEeWoggrRE9kXrQ",
        "clientSecret": "YXA6zZbat7PKgOlN73rpByc36LWaUhw",
        "target": "2.1",
        "test": {
            "collection": "nodejs",
            "email": "authtest@test.com",
            "password": "P@ssw0rd",
            "username": "authtest"
        }
    }

};

var configs = []
configs.push(_.get(targetedConfigs,'1.0'))
// configs.push(_.get(targetedConfigs,'2.1'))

var testFile = {
    uri:'https://raw.githubusercontent.com/apache/usergrid-javascript/master/tests/resources/images/apigee.png',
    contentLength: 6010,
    contentType: 'image/png'
};

var _slow = 3000, _timeout = 4000, defaultSleepTime = 200;

function sleepFor( sleepDuration ){
    if( defaultSleepTime > 0 ) {
        var now = new Date().getTime();
        while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
    }
}

beforeEach(function(done) {
    this.slow(_slow);
    this.timeout(_timeout);
    done();
});

function randomWord() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function uuid() {
    var d = _.now();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + _.random(16)) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
