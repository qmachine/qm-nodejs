//- JavaScript source code

//- defs-mongo.js ~~
//
//  These definitions are chosen by default in the QM project Makefile.
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 14 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

    /*properties
        api, avar_ttl, background, body, box, collect_garbage, collection,
        connect, ensureIndex, error, exp_date, expireAfterSeconds, fields,
        find, findAndModify, gc_interval, get_avar, get_list, '_id', insert,
        isWorker, key, length, log, '$lt', mongo, MongoClient, now, on, push,
        remove, safe, '$set', set_avar, sparse, status, stream, update, upsert
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
         // This function isn't always needed now that QM uses TTL collections.
         // Since Mongo guarantees that it will remove outdated documents every
         // 60 seconds, we only need to remove documents manually if the
         // `gc_interval` is less than 60 seconds. See Mongo's documentation at
         // http://docs.mongodb.org/manual/tutorial/expire-data/ for more info.
            var oldest, query;
            oldest = new Date(Date.now() - (1000 * options.gc_interval));
            query = {'exp_date': {'$lt': oldest}};
            if (options.gc_interval < 60) {
                db.collection('avars').remove(query, function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                        return;
                    }
                    console.log('Finished collecting garbage.');
                    return;
                });
            }
            return;
        };

        get_avar = function (params, callback) {
         // This function retrieves an avar's representation if it exists, and
         // it also updates the "expiration date" of the avar in the database
         // so that data still being used for computations will not be removed.
            var f, opts, query, update;
            f = function (err, doc) {
             // This is the callback function for `findAndModify`.
                if (err !== null) {
                    return callback(err, undefined);
                }
                return callback(null, (doc === null) ? undefined : doc.body);
            };
            opts = {
                'fields': {
                    '_id': 0,
                    'body': 1
                },
                'upsert': false
            };
            query = {
                'box': params[0],
                'key': params[1]
            };
            update = {
                '$set': {
                    'exp_date': new Date(Date.now() + (1000 * options.avar_ttl))
                }
            };
            db.collection('avars').findAndModify(query, [], update, opts, f);
            return;
        };

        get_list = function (params, callback) {
         // This function needs documentation.
            var docs, opts, query, stream;
            docs = [];
            opts = {
                'fields': {
                    '_id': 0,
                    'key': 1
                }
            };
            query = {
                'box': params[0],
                'status': params[1]
            };
            stream = db.collection('avars').find(query, opts).stream();
            stream.on('close', function () {
             // This function needs documentation.
                return callback(null, docs);
            });
            stream.on('data', function (doc) {
             // This function needs documentation.
                docs.push(doc.key);
                return;
            });
            stream.on('error', callback);
            return;
        };

        set_avar = function (params, callback) {
         // This function needs documentation.
            var obj, opts, query;
            obj = {
                'body': params[params.length - 1],
                'box':  params[0],
                'exp_date': new Date(Date.now() + (1000 * options.avar_ttl)),
                'key':  params[1]
            };
            if (params.length === 4) {
                obj.status = params[2];
            }
            opts = {
                'safe': true,
                'upsert': true
            };
            query = {
                'box': params[0],
                'key': params[1]
            };
            db.collection('avars').update(query, obj, opts, callback);
            return;
        };

        mongo.connect(options.mongo, function (err, db_handle) {
         // This function initializes a connection to MongoDB and also creates
         // a TTL index on the collection.
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            if (cluster.isWorker) {
                return;
            }
            db.collection('avars').ensureIndex({'exp_date': 1}, {
                'expireAfterSeconds': 0
            }, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                var f, query, opts;
                f = function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    console.log('API: MongoDB storage is ready.');
                    return;
                };
                query = {
                    'box': 1,
                    'key': 1
                };
                opts = {
                    //'background': true,
                    'sparse': true
                };
                db.collection('avars').ensureIndex(query, opts, f);
                return;
            });
            return;
        });

        return {
            'collect_garbage': collect_garbage,
            'get_avar': get_avar,
            'get_list': get_list,
            'set_avar': set_avar
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
         // This function needs attention, because it occasionally fails when
         // `db` is undefined. It may well be that storing a handle is not a
         // good idea ...
            db.collection('traffic').insert(obj, {'safe': false});
            return;
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
