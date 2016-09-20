
function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}

function flattenArgs(args) {
    return _.flattenDeep(Array.prototype.slice.call(args))
}

function validateAndRetrieveClient(args) {
    var client = undefined;
    if (args instanceof UsergridClient) { client = args }
    else if (args[0] instanceof UsergridClient) { client = args[0] }
    else if (Usergrid.isInitialized) { client = Usergrid.getInstance() }
    else { throw new Error("this method requires either the Usergrid shared instance to be initialized or a UsergridClient instance as the first argument") }
    return client
}

function configureTempAuth(auth) {
    if (_.isString(auth) && auth !== UsergridAuthMode.NONE) {
        return new UsergridAuth(auth)
    } else if (!auth || auth === UsergridAuthMode.NONE) {
        return undefined
    } else if (auth instanceof UsergridAuth) {
        return auth
    } else {
        return undefined
    }
}
