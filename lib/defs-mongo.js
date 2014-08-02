//- JavaScript source code

//- defs-mongo.js ~~
//
//  These definitions are chosen by default in the QM project Makefile.
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 02 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

    /*properties
        api, avar_ttl, background, body, box_status, collect_garbage,
        collection, connect, ensureIndex, error, exp_date, expireAfterSeconds,
        find, findAndModify, get_avar, get_list, '_id', insert, isWorker, key,
        length, log, mongo, MongoClient, now, on, push, safe, '$set', set_avar,
        sparse, stream, update, upsert
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
         // are now taking advantage of TTL collections. See the documentation
         // at http://docs.mongodb.org/manual/tutorial/expire-data/.
            //console.log('(fake garbage collection)');
            return;
        };

        get_avar = function (params, callback) {
         // This function retrieves an avar's representation if it exists, and
         // it also updates the "expiration date" of the avar in the database
         // so that data still being used for computations will not be removed.
            var exp_date, f, query;
            exp_date = new Date(Date.now() + (1000 * options.avar_ttl));
            f = function (err, doc) {
             // This is the callback function for `findAndModify`.
                if (err !== null) {
                    return callback(err, undefined);
                }
                return callback(null, (doc === null) ? undefined : doc.body);
            };
            query = {'_id': params[0] + '&' + params[1]};
            db.collection('avars').findAndModify(query,
                [], {'$set': {'exp_date': exp_date}}, {'upsert': false}, f);
            return;
        };

        get_list = function (params, callback) {
         // This function needs documentation.
            var docs, query, stream;
            docs = [];
            query = {'box_status': params[0] + '&' + params[1]};
            stream = db.collection('avars').find(query).stream();
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
            var exp_date, obj, opts, query;
            exp_date = new Date(Date.now() + (1000 * options.avar_ttl));
            if (params.length === 4) {
                obj = {
                    '_id':          params[0] + '&' + params[1],
                    'body':         params[3],
                    'box_status':   params[0] + '&' + params[2],
                    'exp_date':     exp_date,
                    'key':          params[1]
                };
            } else {
                obj = {
                    '_id':          params[0] + '&' + params[1],
                    'body':         params[2],
                    'exp_date':     exp_date,
                    'key':          params[1]
                };
            }
            opts = {'safe': true, 'upsert': true};
            query = {'_id': params[0] + '&' + params[1]};
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
                var f, opts;
                f = function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    return;
                };
                opts = {'background': true, 'sparse': true};
                db.collection('avars').ensureIndex('box_status', opts, f);
                console.log('API: MongoDB storage is ready.');
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
         // This function needs documentation.
            db.collection('traffic').insert(obj, {'safe': false});
            return;
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
