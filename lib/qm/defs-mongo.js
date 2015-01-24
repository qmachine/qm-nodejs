//- JavaScript source code

//- defs-mongo.js ~~
//
//  These definitions are chosen by default in the QM project Makefile.
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 23 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

    /*properties
        api, avar_ttl, background, body, box, checkKeys, collect_garbage,
        collection, connect, ensureIndex, error, exp_date, expireAfterSeconds,
        fields, find, findAndModify, forceServerObjectId, gc_interval,
        get_avar, get_list, '_id', insert, isWorker, key, length, log, '$lt',
        mongo, MongoClient, now, on, push, remove, safe, '$set', set_avar,
        status, stream, unique, update, upsert
    */

 // Declarations

    var cluster, mongo;

 // Definitions

    cluster = require('cluster');

    mongo = require('mongodb').MongoClient;

 // Out-of-scope definitions

    exports.api = function (settings) {
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
            if (settings.gc_interval > 60) {
                return;
            }
            var query = {
                'exp_date': {
                    '$lt': new Date(Date.now() - (1000 * settings.avar_ttl))
                }
            };
            db.collection('avars').remove(query, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                console.log('Finished collecting garbage.');
                return;
            });
            return;
        };

        get_avar = function (params, callback) {
         // This function retrieves an avar's representation if it exists, and
         // it also updates the "expiration date" of the avar in the database
         // so that data still being used for computations will not be removed.
            var f, opts, query, update;
            f = function (err, doc) {
             // This is the callback function for `findAndModify`.
                return callback(err, (doc instanceof Object) ? doc.body : '{}');
            };
            opts = {
                'checkKeys': false, // WARNING: VULNERABLE TO INJECTION ATTACK
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
                    'exp_date': new Date(Date.now() +
                            (1000 * settings.avar_ttl))
                }
            };
            db.collection('avars').findAndModify(query, [], update, opts, f);
            return;
        };

        get_list = function (params, callback) {
         // This function retrieves a list of "key" properties for avars in the
         // database that have a "status" property, because those are assumed
         // to represent task descriptions. The function returns the list as a
         // JSON array in which order is not important.
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
         // This function writes an avar to the database by "upserting" a Mongo
         // document that represents it.
            var doc, opts, query;
            doc = {
                'body': params[params.length - 1],
                'box':  params[0],
                'exp_date': new Date(Date.now() + (1000 * settings.avar_ttl)),
                'key':  params[1]
            };
            if (params.length === 4) {
                doc.status = params[2];
            }
            opts = {
                'safe': true,
                'upsert': true
            };
            query = {
                'box': params[0],
                'key': params[1]
            };
            db.collection('avars').update(query, doc, opts, callback);
            return;
        };

     // Invocations

        mongo.connect(settings.mongo, {
            'forceServerObjectId': true
        }, function (err, db_handle) {
         // This function initializes a connection to MongoDB and also creates
         // a TTL index on the collection.
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            //process.on('exit', db.close);
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
                    'unique': true
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

    exports.log = function (settings) {
     // This function needs documentation.
        var db;
        mongo.connect(settings.mongo, function (err, db_handle) {
         // This function stores a reference to the database for reuse by the
         // logging function. This avoids overhead for re-connecting and also
         // helps minimize the total number of connections to the server, which
         // helps with scale-out.
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            //process.on('exit', db.close);
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
