//- JavaScript source code

//- couch-log-ddoc.js ~~
//                                                      ~~ (c) SRW, 31 Mar 2013
//                                                  ~~ last updated 05 Jul 2014

(function () {
    'use strict';

 // Pragmas

    /*global exports: false, getRow: false, send: false, sum: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint couch: true, indent: 4, maxlen: 80, nomen: true, unparam: true */

    /*properties
        'as-array', box_frequency, hasOwnProperty, _id, identity, ip,
        ip_frequency, ips, lists, map, method, reduce, replace, shows, slice,
        split, stringify, timestamp, updates, url, value, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {
        'as-array': function () {
         // This function can be useful for dumping the entire contents of the
         // database for export into another database:
         //
         //     $ curl -o couch-dump.json \
         //         localhost:5984/traffic/_design/app/_list/as-array/identity
         //
            var first, row;
            first = true;
            row = getRow();
            send('[');
            while (row !== null) {
                if (first === true) {
                    first = false;
                    send(JSON.stringify(row.value));
                } else {
                    send(',' + JSON.stringify(row.value));
                }
                row = getRow();
            }
            send(']');
            return;
        }
    };

    exports.shows = {};

    exports.updates = {};

    exports.views = {

        box_frequency: {
            map: function (doc) {
             // This function needs documentation.
                var pattern;
                if (doc.hasOwnProperty('url')) {
                    pattern = /^\/box\/([\w\-]+)\?/;
                    doc.url.replace(pattern, function (match, box) {
                     // This function needs documentation.
                        emit(box, 1);
                        return;
                    });
                    return;
                }
                return;
            },
            reduce: function (key, values) {
             // This function can be replaced by the built-in `"_count"` reduce
             // function, if you are using Apache CouchDB 1.5 or later. See
             // http://goo.gl/0Qfr2q for more information.
                return sum(values);
            }
        },

        identity: {
            map: function (doc) {
             // This function needs documentation.
                if (doc._id.slice(0, 8) !== '_design/') {
                    emit(null, {
                        ip:         doc.ip,
                        method:     doc.method,
                        timestamp:  doc.timestamp,
                        url:        doc.url
                    });
                }
                return;
            }
        },

        ip_frequency: {
            map: function (doc) {
             // This function needs documentation.
                if (doc.hasOwnProperty('ip')) {
                    emit(doc.ip.split(', ')[0], 1);
                }
                return;
            },
            reduce: function (key, values) {
             // This function can be replaced by the built-in `"_count"` reduce
             // function, if you are using Apache CouchDB 1.5 or later. See
             // http://goo.gl/0Qfr2q for more information.
                return sum(values);
            }
        }

    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
