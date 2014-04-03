//- JavaScript source code

//- defs-mongo.js ~~
//
//  These definitions are getting a lot more attention now :-)
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 03 Apr 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

    /*properties
        _id, api, avar_ttl, background, body, box_status, collect_garbage,
        collection, connect, ensureIndex, error, exp_date, expireAfterSeconds,
        find, findOne, get_avar, get_list, insert, isWorker, key, length, log,
        mongo, MongoClient, on, push, safe, set_avar, sparse, stream, update,
        upsert
    */

 // Declarations

    var cluster, mongo;

 // Definitions

    cluster = require('cluster');

    mongo = require('mongodb').MongoClient;

 // Out-of-scope definitions

    exports.api = function (options) {
     // This function needs documentation, but as far as connection pooling is
     // concerned, my strategy is justified by the post on Stack Overflow at
     // http://stackoverflow.com/a/14464750.

        var collect_garbage, db, get_avar, get_list, set_avar;

        collect_garbage = function () {
         // This function isn't even needed anymore, because these definitions
         // are now taking advantage of TTL collections :-)
            console.log('(fake garbage collection)');
            return;
        };

        get_avar = function (params, callback) {
         // This function needs documentation.
            var pattern = {_id: params[0] + '&' + params[1]};
            db.collection('avars').findOne(pattern, function (err, item) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                return callback(null, (item === null) ? undefined : item.body);
            });
            return;
        };

        get_list = function (params, callback) {
         // This function needs documentation.
            var items, pattern, stream;
            items = [];
            pattern = {box_status: params[0] + '&' + params[1]};
            stream = db.collection('avars').find(pattern).stream();
            stream.on('close', function () {
             // This function needs documentation.
                return callback(null, items);
            });
            stream.on('data', function (item) {
             // This function needs documentation.
                items.push(item.key);
                return;
            });
            stream.on('error', callback);
            return;
        };

        set_avar = function (params, callback) {
         // This function needs documentation.
            var obj, opts, spec;
            if (params.length === 4) {
                obj = {
                    _id:        params[0] + '&' + params[1],
                    body:       params[3],
                    box_status: params[0] + '&' + params[2],
                    exp_date:   new Date(),
                    key:        params[1]
                };
            } else {
                obj = {
                    _id:        params[0] + '&' + params[1],
                    body:       params[2],
                    exp_date:   new Date(),
                    key:        params[1]
                };
            }
            opts = {safe: true, upsert: true};
            spec = {_id: params[0] + '&' + params[1]};
            db.collection('avars').update(spec, obj, opts, callback);
            return;
        };

        mongo.connect(options.mongo, function (err, db_handle) {
         // This function is a LOT simpler than what I had before!
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            if (cluster.isWorker) {
                return;
            }
            db.collection('avars').ensureIndex('exp_date', {
                expireAfterSeconds: options.avar_ttl
            }, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                var f, opts;
                f = function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    return;
                };
                opts = {background: true, sparse: true};
                db.collection('avars').ensureIndex('box_status', opts, f);
                console.log('API: MongoDB storage is ready.');
                return;
            });
            return;
        });

        return {
            collect_garbage: collect_garbage,
            get_avar: get_avar,
            get_list: get_list,
            set_avar: set_avar
        };
    };

    exports.log = function (options) {
     // This function needs documentation.
        var db;
        mongo.connect(options.mongo, function (err, db_handle) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            return;
        });
        return function (obj) {
         // This function needs documentation.
            db.collection('traffic').insert(obj, {safe: false});
         /*
            db.collection('traffic').save(obj, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                }
                return;
            });
         */
            return;
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
