var request = require("request");
var PouchDB = require('pouchdb');

var Worker = function (server, user, fn) {
    // reference to this
    this.server = server;
    this.user = user;
    this.db = null;
    
    if ( !server
      || !server.loginUrl
      || !server.logoutUrl
      || !server.syncGatewayUrl
      || !user || !user.email || !user.password
    ) {
        fn('invalid configuration!');
    } else {
        // set http request to login server
        request({
            uri     : server.loginUrl,
            method  : "POST",
            form    : {
                email       : this.user.email,
                password    : this.user.password
            }
        }, function(error, response, body) {    
            if (error) {
                fn(error);
            } else if (!response || !response.headers) {
                fn('response headers not available.');
            } else if (!response.headers['set-cookie']) {
                fn('response set-cookie not available.');
            } else if (-1 != response.headers['set-cookie'][0].indexOf('errors')) {
                fn(response.headers['set-cookie']);
            } else {
                // open database connection with PouchDB
                this.db = new PouchDB(this.server.syncGatewayUrl, { headers: {'Cookie' : response.headers['set-cookie'][0]} });
                // callback with no error and database handle
                fn(undefined, this.db);
            }
        });
    }
};

Worker.prototype.close = function () {
    this.db = null;
    
    // set http request to login server
    request({
        uri     : this.server.logoutUrl,
        method  : "GET",
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        }
    });
}

// export module
module.exports = Worker;