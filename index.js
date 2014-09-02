var querystring = require('querystring');
var http = require('http');
var PouchDB = require('pouchdb');
var events = require('events');

var worker = function (config, callback) {
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

    var db;

    // set http request to login server
    var req = http.request(options, function(res) {
       // console.log(res);
        console.log(res.headers['set-cookie'][0]);
        
        db = new PouchDB(DATABASE_ADDRESS, { headers: {'Cookie' : res.headers['set-cookie'][0]} });
        console.log('database loaded');
        
        method();
    });

    var method = function() {
        db.changes({since : 'now', live : true})
            .on('change', function (info) {
                console.log(info);
            }).on('complete', function (info) {
                console.log(info);
            }).on('error', function (err) {
                console.log(err);
        });
    };

    // write request
    req.write(data);
    req.end();
};

module.exports = worker;