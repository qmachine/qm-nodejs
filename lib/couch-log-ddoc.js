//- JavaScript source code

//- couch-log-ddoc.js ~~
//
//  This design document isn't strictly necessary for logging to CouchDB. All
//  it does is help you get your data back out of CouchDB, and it provides that
//  only because the authors of CouchDB have never seen fit to provide such a
//  "feature" themselves.
//
//                                                      ~~ (c) SRW, 31 Mar 2013
//                                                  ~~ last updated 14 Jul 2014

(function () {
    'use strict';

 // Pragmas

    /*global exports: false, getRow: false, send: false, sum: false */

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint couch: true, indent: 4, maxlen: 80, nomen: true */

    /*properties
        'as-array', _id, identity, lists, map, shows, slice, stringify,
        updates, value, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {
        'as-array': function () {
         // This function is useful for dumping the entire contents of the
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
        identity: {
            map: function (doc) {
             // This function needs documentation.
                if (doc._id.slice(0, 8) !== '_design/') {
                    emit(null, doc);
                }
                return;
            }
        }
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
