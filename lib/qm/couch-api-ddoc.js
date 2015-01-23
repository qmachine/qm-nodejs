//- JavaScript source code

//- couch-api-ddoc.js ~~
//                                                      ~~ (c) SRW, 23 Oct 2012
//                                                  ~~ last updated 12 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*global exports: false, getRow: false, send: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint couch: true, indent: 4, maxlen: 80, nomen: true, unparam: true */

    /*properties
        'as-array', body, box_status, 'Content-Type', data, _deleted,
        hasOwnProperty, headers, _id, jobs, key, last_touch, lists, map, now,
        outdated, parse, _rev, shows, split, stringify, touch, updates, upsert,
        value, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {
        'as-array': function () {
         // This function needs documentation.
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

    exports.updates = {
     // NOTE: Do not out-clever yourself here! You _can_ add the CORS
     // headers in this function, but if you're already doing it inside an
     // external webserver like Nginx or Node.js, it will cause CORS _not_
     // to work.
        touch: function (doc, req) {
         // This function will be used to implement "touch" for `get_avar`.
            var response;
            response = {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: (doc === null) ? '{}' : doc.body
            };
            if (doc instanceof Object) {
                doc.last_touch = Date.now();
            }
            return [doc, response];
        },
        upsert: function (doc, req) {
         // This function needs documentation.
            var key, newDoc, response;
            newDoc = JSON.parse(req.body);
            response = {
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: ''
            };
            newDoc.last_touch = Date.now();
            if (doc === null) {
             // We are inserting a new document.
                return [newDoc, response];
            }
         // We are updating the existing document.
            for (key in newDoc) {
                if (newDoc.hasOwnProperty(key)) {
                    doc[key] = newDoc[key];
                }
            }
            return [doc, response];
        }
    };

    exports.views = {
        jobs: {
            map: function (doc) {
             // This function needs documentation.
                var flag;
                flag = ((doc.hasOwnProperty('box_status'))  &&
                        (doc.hasOwnProperty('key')));
                if (flag === true) {
                    emit(doc.box_status.split('&'), doc.key);
                }
                return;
            }
        },
        outdated: {
            map: function (doc) {
             // This function outputs a JSON array that I can modify slightly
             // and POST back to Couch via the Bulk Documents API in order to
             // delete all documents that are past their expiration dates.
                if (doc.hasOwnProperty('last_touch')) {
                    emit(doc.last_touch, {
                        _id: doc._id,
                        _rev: doc._rev,
                        _deleted: true
                    });
                }
                return;
            }
        }
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
