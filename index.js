var querystring = require('querystring');
var http = require('http');
var PouchDB = require('pouchdb');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var worker = function (config) {
    // reference to this
    var self = this;
    
    if ( !config
      || !config.user || !config.user.username || !config.user.password
      || !config.user || !config.user.username || !config.user.password
      || !config.server || !config.server.host || !config.server.port || !config.server.path
      || !config.syncGateway
    ) {
        self.emit('error', 'invalid configuration!');
    }
    
    this.on('newListener', function(listener) {

    });
    
    // create data package to send for login
    var data = querystring.stringify({
          email     : config.user.username,
          password  : config.user.password
    });

    // set options for login
    var options = {
        host    : config.server.host,
        port    : config.server.port,
        path    : config.server.path,
        method  : 'POST',
        headers : 
        {
            'Content-Type'      :   'application/x-www-form-urlencoded',
            'Content-Length'    :   Buffer.byteLength(data)
        }
    };

    // handle for the database, which will be opened with pouchdb
    var db;

    // set http request to login server
    var req = http.request(options, function(res) {
        if (!res.headers['set-cookie']) {
            self.emit('error', 'login failed');
            return;
        }
  
        db = new PouchDB(config.syncGateway, { headers: {'Cookie' : res.headers['set-cookie'][0]} });

        self.emit('open', db); 
    });
    
    // write request
    req.write(data);
    req.end();
};

// extend the EventEmitter class using our Radio class
util.inherits(worker, EventEmitter);
// export module
module.exports = worker;