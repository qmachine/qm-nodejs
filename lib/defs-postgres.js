//- JavaScript source code

//- defs-postgres.js ~~
//
//  These definitions need help from an RDBMS guru.
//
//  Known shortcomings:
//  -   The API definition for `get_avar` does not update `exp_date`.
//  -   The API storage definitions do not take advantage of indexing.
//  -   The log storage definition assumes that hstore is available.
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 10 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api, avar_ttl, body, ceil, collect_garbage, connect, error, get_avar,
        get_list, hasOwnProperty, isMaster, join, key, length, log, map, now,
        postgres, push, query, rows, set_avar, stringify
    */

 // Declarations

    var cluster, pg;

 // Definitions

    cluster = require('cluster');

    pg = require('pg');                 //- or, use `require('pg').native` ...

 // Out-of-scope definitions

    exports.api = function (options) {
     // This function needs documentation.

        var collect_garbage, connection_string, exp_date, get_avar, get_list,
            set_avar;

        collect_garbage = function () {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    done();
                    return;
                }
                var now, sql;
                now = Math.ceil(Date.now() / 1000);
                sql = 'DELETE FROM avars WHERE (exp_date < $1)';
                client.query(sql, [now], function (err) {
                 // This function n needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    } else {
                        console.log('Finished collecting garbage.');
                    }
                    done();
                    return;
                });
                return;
            });
            return;
        };

        connection_string = options.postgres;

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + options.avar_ttl);
        };

        get_avar = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var x = 'SELECT body FROM avars WHERE box_key = $1';
                client.query(x, [params.join('&')], function (err, results) {
                 // This function needs documentation.
                    done();
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    if (results.rows.length < 1) {
                        return callback(null, undefined);
                    }
                    return callback(null, results.rows[0].body);
                });
                return;
            });
            return;
        };

        get_list = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var x = 'SELECT key FROM avars WHERE box_status = $1';
                client.query(x, [params.join('&')], function (err, results) {
                 // This function needs documentation.
                    done();
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    var y = (results === undefined) ? {rows: []} : results;
                    return callback(null, y.rows.map(function (row) {
                     // This function needs documentation.
                        return row.key;
                    }));
                });
                return;
            });
            return;
        };

        set_avar = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var args, sql;
                if (params.length === 4) {
                    args = [
                        params[3],
                        params[0] + '&' + params[1],
                        params[0] + '&' + params[2],
                        exp_date(),
                        params[1]
                    ];
                    sql = 'SELECT upsert_task($1, $2, $3, $4, $5)';
                } else {
                    args = [
                        params[2],
                        params[0] + '&' + params[1],
                        exp_date()
                    ];
                    sql = 'SELECT upsert_avar($1, $2, $3)';
                }
                client.query(sql, args, function (err, results) {
                 // This function needs documentation.
                    done();
                    return callback(err, results);
                });
                return;
            });
            return;
        };

        if (cluster.isMaster) {
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    throw err;
                }
                var lines;
                lines = [
                    'CREATE TABLE IF NOT EXISTS avars (',
                    '   body TEXT NOT NULL,',
                    '   box_key TEXT NOT NULL,',
                    '   box_status TEXT,',
                    '   exp_date INTEGER NOT NULL,',
                    '   key TEXT,',     //- this doesn't need to be "NOT NULL"
                    '   PRIMARY KEY (box_key)',
                    ');',
                    'CREATE OR REPLACE FUNCTION upsert_avar' +
                        '(b2 TEXT, bk2 TEXT, ed2 INTEGER) RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = b2,' +
                        '           box_status = NULL,' +
                        '           exp_date = ed2,' +
                        '           key = NULL',
                    '           WHERE box_key = bk2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars (body, box_key, exp_date)',
                    '               VALUES (b2, bk2, ed2);',
                    '           RETURN;',
                    '       EXCEPTION WHEN unique_violation THEN',
                    '       END;',
                    '   END LOOP;',
                    'END;',
                    '$$',
                    'LANGUAGE plpgsql;',
                    'CREATE OR REPLACE FUNCTION upsert_task' +
                        '(b2 TEXT, bk2 TEXT, bs2 TEXT, ed2 INTEGER, k2 TEXT)' +
                        'RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = b2,' +
                        '           box_status = bs2,' +
                        '           exp_date = ed2,' +
                        '           key = k2',
                    '           WHERE box_key = bk2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars ' +
                        '           (body, box_key, box_status, exp_date, key)',
                    '               VALUES (b2, bk2, bs2, ed2, k2);',
                    '           RETURN;',
                    '       EXCEPTION WHEN unique_violation THEN',
                    '       END;',
                    '   END LOOP;',
                    'END;',
                    '$$',
                    'LANGUAGE plpgsql;'
                ];
                client.query(lines.join('\n'), function (err) {
                 // This function also accepts a second argument that contains
                 // the "results" of the query, but because I don't use it, I
                 // have omitted it to avoid irritating JSLint et al.
                    done();
                    if (err !== null) {
                        throw err;
                    }
                    console.log('API: Postgres storage is ready.');
                    return;
                });
                return;
            });
        }

        return {
            collect_garbage: collect_garbage,
            get_avar: get_avar,
            get_list: get_list,
            set_avar: set_avar
        };
    };

    exports.log = function (options) {
     // This function needs documentation.
        pg.connect(options.postgres, function (err, client, done) {
         // This function needs documentation.
            if (err !== null) {
                done();
                throw err;
            }
            var lines;
            lines = [
                'CREATE EXTENSION IF NOT EXISTS hstore;',
                'CREATE TABLE IF NOT EXISTS traffic (',
                '   id serial PRIMARY KEY,',
                '   doc hstore',
                ');'
            ];
            client.query(lines.join('\n'), function (err) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                }
                done();
                return;
            });
            return;
        });
        return function (obj) {
         // This function needs documentation.
            pg.connect(options.postgres, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    throw err;
                }
                var doc, key, sql, temp;
                temp = [];
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        temp.push(key + ' => ' + JSON.stringify(obj[key]));
                    }
                }
                doc = temp.join(', ');
                sql = 'INSERT INTO traffic (doc) VALUES (\'' + doc + '\');';
                client.query(sql, function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    done();
                    return;
                });
                return;
            });
            return;
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
