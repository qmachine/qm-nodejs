//- JavaScript source code

//- custom-log.js ~~
//
//  This file contains a custom `log` function for the QMachine service.
//
//                                                      ~~ (c) SRW, 24 Jan 2015
//                                                  ~~ last updated 24 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        connection, 'content-length', content_length, dnt, hasOwnProperty,
        headers, host, ip, log, method, remoteAddress, split, timestamp, url,
        'x-forwarded-for'
    */

 // Module definitions

    exports.log = function (request) {
     // This is a custom logging function that executes once for every request
     // if logging is enabled. This function is optional, however, because
     // QMachine provides a default logging function. I have used a convention
     // in which hyphens are converted into underscores in order to prevent
     // inconveniences with certain tools that attempt to auto-detect schemas
     // from JSON. Ironically, the "Do Not Track" header (DNT) is logged
     // alongside the tracking data because I don't understand the legal stuff
     // yet, but I will delete all personal data from entries that opted out
     // once I figure out which data are considered "personal". To use this
     // function when launching the service, just copy/paste it or use
     //
     //     require('qm').launch_service({
     //         // ...
     //         log: require('/path/to/this/file/').log,
     //         // ...
     //     });
     //
        var headers, y;
        headers = request.headers;
        y = {
            host: headers.host,
            method: request.method,
            timestamp: new Date(),
            url: request.url
        };
        if (headers.hasOwnProperty('content-length')) {
            y.content_length = parseInt(headers['content-length'], 10);
        }
        if (headers.hasOwnProperty('dnt')) {
         // See http://goo.gl/Rrxu4L.
            y.dnt = parseInt(headers.dnt, 10);
        }
        if (headers.hasOwnProperty('x-forwarded-for')) {
         // See http://goo.gl/ZtqLv1.
            y.ip = headers['x-forwarded-for'].split(',')[0];
        } else {
            y.ip = request.connection.remoteAddress;
        }
        return y;
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
