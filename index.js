var request = require("request");
var PouchDB = require('pouchdb');

var Worker = function (config, fn) {
    // reference to this
    this.config = config;
    this.db = null;
    
    if ( !config
      || !config.user || !config.user.email || !config.user.password
      || !config.loginUrl
      || !config.logoutUrl
      || !config.syncGatewayUrl
    ) {
        fn('invalid configuration!');
    } else {
        // set http request to login server
        request({
            uri     : config.loginUrl,
            method  : "POST",
            form    : {
                email       : config.user.email,
                password    : config.user.password
            }
        }, function(error, response, body) {    
            if (error) {
                self.emit('error', error);
            } else if (!response || !response.headers) {
                self.emit('error', 'response headers not available.');
            } else if (!response.headers['set-cookie']) {
                self.emit('error', 'response set-cookie not available.');
            } else if (-1 != response.headers['set-cookie'][0].indexOf('errors')) {
                self.emit('error', response.headers['set-cookie']);
            } else {
                // open database connection with PouchDB
                this.db = new PouchDB(config.syncGatewayUrl, { headers: {'Cookie' : response.headers['set-cookie'][0]} });
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
        uri     : this.config.logoutUrl,
        method  : "GET",
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        }
    });
}

// export module
module.exports = Worker;