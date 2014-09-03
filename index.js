var request = require("request");
var PouchDB = require('pouchdb');

var Worker = function (server, user, fn) {
    // reference to this
    self = this;
    self.server = server;
    self.user = user;
    self.db = null;
    
    var returnError = function (msg) {
        fn("Login with " + JSON.stringify(self, undefined, 2) + " failed with Error: "+msg);
    };
    
    if ( !server
      || !server.loginUrl
      || !server.logoutUrl
      || !server.syncGatewayUrl
      || !user || !user.email || !user.password
    ) {
        error('invalid configuration!');
    } else {
        // set http request to login server
        request({
            uri     : server.loginUrl,
            method  : "POST",
            form    : {
                email       : self.user.email,
                password    : self.user.password
            }
        }, function(error, response, body) {
            if (error) {
                returnError(error);
            } else if (!response || !response.headers) {
                returnError("response headers not available.");
            } else if (!response.headers['set-cookie']) {
                returnError("response set-cookie not available.");
            } else if (-1 != response.headers['set-cookie'][0].indexOf('errors')) {
                returnError(response.headers['set-cookie']);
            } else {
                // open database connection with PouchDB
                self.db = new PouchDB(self.server.syncGatewayUrl, { headers: {'Cookie' : response.headers['set-cookie'][0]} });
                // callback with no error and database handle
                fn(undefined, self.db);
            }
        });
    }
};

Worker.prototype.close = function () {
    self.db = null;
    
    // set http request to login server
    request({
        uri     : self.server.logoutUrl,
        method  : "GET",
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        }
    });
}

// export module
module.exports = Worker;