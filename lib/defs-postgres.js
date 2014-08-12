//- JavaScript source code

//- defs-postgres.js ~~
//
//  These definitions need help from an RDBMS guru.
//
//  Known shortcomings:
//  -   The API storage definitions do not take advantage of indexing.
//  -   The log storage definition assumes that hstore is available.
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 12 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api, avar_ttl, body, collect_garbage, connect, error, get_avar,
        get_list, hasOwnProperty, isMaster, join, key, length, log, map,
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

        var collect_garbage, connection_string, get_avar, get_list,
            set_avar;

        collect_garbage = function () {
         // This function is only a placeholder, now that QM uses an INSERT
         // trigger to evict old rows automatically.
            // ...
            return;
        };

        connection_string = options.postgres;

        get_avar = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var x = [
                    'UPDATE avars SET exp_date = NOW()',
                    'WHERE box_key = $1',
                    'RETURNING body'
                ].join(' ');
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
                        params[1]
                    ];
                    sql = 'SELECT upsert_task($1, $2, $3, $4)';
                } else {
                    args = [
                        params[2],
                        params[0] + '&' + params[1]
                    ];
                    sql = 'SELECT upsert_avar($1, $2)';
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
                    '   exp_date TIMESTAMP NOT NULL DEFAULT NOW(),',
                    '   key TEXT,',     //- this doesn't need to be "NOT NULL"
                    '   PRIMARY KEY (box_key)',
                    ');',
                    'CREATE OR REPLACE FUNCTION evict_old_avars() ' +
                        'RETURNS trigger AS',
                    '$$',
                    'BEGIN',
                    '   DELETE FROM avars',
                    '   WHERE exp_date < NOW() - INTERVAL \'' +
                            options.avar_ttl + ' seconds\';',
                    '   RETURN NEW;',
                    'END;',
                    '$$',
                    'language plpgsql;',
                    'DROP TRIGGER IF EXISTS avar_gc ON avars;',
                    'CREATE TRIGGER avar_gc',
                    '   AFTER INSERT ON avars',
                    '   EXECUTE PROCEDURE evict_old_avars();',
                    'CREATE OR REPLACE FUNCTION upsert_avar' +
                        '(b2 TEXT, bk2 TEXT) RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = b2,' +
                        '           box_status = NULL,' +
                        '           exp_date = NOW(),' +
                        '           key = NULL',
                    '           WHERE box_key = bk2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars (body, box_key)',
                    '               VALUES (b2, bk2);',
                    '           RETURN;',
                    '       EXCEPTION WHEN unique_violation THEN',
                    '       END;',
                    '   END LOOP;',
                    'END;',
                    '$$',
                    'LANGUAGE plpgsql;',
                    'CREATE OR REPLACE FUNCTION upsert_task' +
                        '(b2 TEXT, bk2 TEXT, bs2 TEXT, k2 TEXT)' +
                        'RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = b2,' +
                        '           box_status = bs2,' +
                        '           exp_date = NOW(),' +
                        '           key = k2',
                    '           WHERE box_key = bk2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars ' +
                        '           (body, box_key, box_status, key)',
                    '               VALUES (b2, bk2, bs2, k2);',
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
