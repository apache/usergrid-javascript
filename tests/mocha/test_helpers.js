
var config = {
    "orgId": "rwalsh",
    "appId": "jssdktestapp",
    "clientId": "YXA6KPq8cIsPEea0i-W5Jx8cgw",
    "clientSecret": "YXA6WaT7qsxh_eRS3ryBresi-HwoQAQ",
    "target":"1.0",
    "test": {
        "collection":"nodejs",
        "email": "authtest@test.com",
        "password": "P@ssw0rd",
        "username": "authtest"
    }
}
var client = new UsergridClient({orgId: config.orgId, appId: config.appId}),
    testFile = 'http://placekitten.com/160/90',
    expectedContentLength = 2921,
    expectedContentType = 'image/jpeg'

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
