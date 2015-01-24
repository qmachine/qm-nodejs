//- JavaScript source code

//- defs-sqlite.js ~~
//
//  These definitions need help from a SQLite guru.
//
//  Known shortcomings:
//  -   There is no log storage definition.
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 24 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        all, api, avar_ttl, body, '$body', '$box', cached, ceil,
        collect_garbage, Database, '$ed', errno, error, '$exp_date', get,
        get_avar, get_list, isMaster, join, key, '$key', length, log, map,
        nextTick, now, '$now', persistent_storage, run, set_avar, shift,
        slice, sqlite, split, '$status'
    */

 // Declarations

    var cluster, sqlite;

 // Definitions

    cluster = require('cluster');

    sqlite = require('sqlite3');

 // Out-of-scope definitions

    exports.api = function (settings) {
     // This function needs documentation.

        var collect_garbage, connection_string, db, exp_date, get_avar,
            get_list, set_avar;

        collect_garbage = function () {
         // This function needs documentation.
            var args, query;
            args = {
                '$now': Math.ceil(Date.now() / 1000)
            };
            query = 'DELETE FROM avars WHERE (exp_date < $now)';
            db.run(query, args, function (err) {
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

        connection_string = settings.persistent_storage.sqlite;

        db = new sqlite.cached.Database(connection_string, function (err) {
         // This function needs documentation.
            var f, queries;
            f = function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                var query = queries.shift();
                if (query === undefined) {
                    console.log('API: SQLite storage is ready.');
                } else {
                    db.run(query, f);
                }
                return;
            };
            queries = [
                'CREATE TABLE IF NOT EXISTS avars (',
                '   body TEXT NOT NULL,',
                '   box TEXT NOT NULL,',
                '   exp_date INTEGER NOT NULL,',
                '   key TEXT NOT NULL,',
                '   status TEXT,',
                '   PRIMARY KEY (box, key)',
                ');' //,
                //'CREATE INDEX IF NOT EXISTS idx_avars_b ON avars (box);',
                //'CREATE INDEX IF NOT EXISTS idx_avars_e ON avars (exp_date);',
                //'CREATE INDEX IF NOT EXISTS idx_avars_k ON avars (key);',
                //'CREATE INDEX IF NOT EXISTS idx_avars_s ON avars (status);'
            ].join('').split(';').slice(0, -1);
            if (cluster.isMaster) {
                f(err);
            }
            return;
        });

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + settings.avar_ttl);
        };

        get_avar = function (params, callback) {
         // This function needs documentation.
            var args, query;
            args = {
                '$box': params[0],
                '$key': params[1]
            };
            query = 'SELECT body FROM avars WHERE box = $box AND key = $key';
            db.get(query, args, function (err, row) {
             // This function needs documentation.
                if (err !== null) {
                    if (err.errno === 5) {
                        process.nextTick(function () {
                         // This function needs documentation.
                            get_avar(params, callback);
                            return;
                        });
                        return;
                    }
                    callback(err, row);
                    return;
                }
                if (row === undefined) {
                 // Return an empty document, because nothing was found.
                    callback(null, '{}');
                    return;
                }
             // The row exists, so update its expiration date.
                args.$exp_date = exp_date();
                query = 'UPDATE avars SET exp_date = $exp_date' +
                        '   WHERE box = $box AND key = $key';
                db.get(query, args, function (err) {
                 // This function needs documentation.
                    callback(err, row.body);
                    return;
                });
                return;
            });
            return;
        };

        get_list = function (params, callback) {
         // This function needs documentation.
            var args, query;
            args = {
                '$box': params[0],
                '$now': Math.ceil(Date.now() / 1000),
                '$status': params[1]
            };
            query = 'SELECT key FROM avars ' +
                    'WHERE box = $box AND exp_date > $now AND status = $status';
            db.all(query, args, function (err, rows) {
             // This function needs documentation.
                if (err !== null) {
                    if (err.errno === 5) {
                        process.nextTick(function () {
                         // This function needs documentation.
                            get_list(params, callback);
                            return;
                        });
                        return;
                    }
                    callback(err, rows);
                    return;
                }
                if (rows === undefined) {
                    callback(null, []);
                    return;
                }
                callback(null, rows.map(function (row) {
                 // This function needs documentation.
                    return row.key;
                }));
                return;
            });
            return;
        };

        set_avar = function (params, callback) {
         // This function needs documentation.
            var args, query;
            args = {
                '$body':        params[params.length - 1],
                '$box':         params[0],
                '$exp_date':    exp_date(),
                '$key':         params[1]
            };
            query = 'INSERT OR REPLACE INTO avars (body, box, exp_date, key)' +
                    '   VALUES ($body, $box, $exp_date, $key)';
            if (params.length === 4) {
                args.$status = params[2];
                query = 'INSERT OR REPLACE INTO avars' +
                        '       (body, box, exp_date, key, status)' +
                        '   VALUES ($body, $box, $exp_date, $key, $status)';
            }
            db.run(query, args, function (err) {
             // This function needs documentation.
                if (err instanceof Object) {
                    if (err.errno === 5) {
                        process.nextTick(function () {
                         // This function needs documentation.
                            set_avar(params, callback);
                            return;
                        });
                        return;
                    }
                }
                callback(err);
                return;
            });
            return;
        };

        return {
            'collect_garbage': collect_garbage,
            'get_avar': get_avar,
            'get_list': get_list,
            'set_avar': set_avar
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
