//- JavaScript source code

//- defs-postgres.js ~~
//
//  These definitions assume Postgres 9.2 or later. They also need optimization
//  help from an RDBMS guru.
//
//  Known shortcomings:
//  -   The log storage definition assumes the "uuid-ossp" extension is
//      available.
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 05 Feb 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api, avar_ttl, body, collect_garbage, connect, error, get_avar,
        get_list, isMaster, isWorker, join, key, length, log, map, native,
        persistent_storage, postgres, push, query, rows, set_avar, stringify,
        trafficlog_storage
    */

 // Declarations

    var cluster, pg;

 // Definitions

    cluster = require('cluster');

    try {
     // If the "pg-native" module is installed, use it for a 30% boost in
     // performance. QM lists "pg-native" as an optional dependency.
        pg = require('pg').native;
    } catch (err) {
     // Fall back to the JS (non-native) implementation of the module :-)
        pg = require('pg');
    }

 // Out-of-scope definitions

    exports.api = function (settings) {
     // This function needs documentation.

        var collect_garbage, connection_string, get_avar, get_list,
            set_avar;

        collect_garbage = function () {
         // This function is only a placeholder, now that QM uses an INSERT
         // trigger to evict old rows automatically.
            return;
        };

        connection_string = settings.persistent_storage.postgres;

        get_avar = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, '{}');
                }
                var x = [
                    'UPDATE avars SET last_touch = NOW()',
                    'WHERE box = $1 AND key = $2 AND ' +
                        'last_touch > NOW() - INTERVAL \'' +
                        settings.avar_ttl + ' seconds\'',
                    'RETURNING body'
                ].join(' ');
                client.query(x, params, function (err, results) {
                 // This function needs documentation.
                    done();
                    if (err !== null) {
                        return callback(err, '{}');
                    }
                    if (results.rows.length === 0) {
                        return callback(null, '{}');
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
                    return callback(err, '[]');
                }
                var x = [
                    'SELECT key FROM avars',
                    'WHERE box = $1 AND status = $2 AND ' +
                        'last_touch > NOW() - INTERVAL \'' +
                        settings.avar_ttl + ' seconds\''
                ].join(' ');
                client.query(x, params, function (err, results) {
                 // This function needs documentation.
                    done();
                    if ((err !== null) || (results === undefined)) {
                        return callback(err, '[]');
                    }
                    var y = JSON.stringify(results.rows.map(function (row) {
                     // This function needs documentation.
                        return row.key;
                    }));
                    return callback(null, y);
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
                    return callback(err);
                }
                var args, sql;
                args = [
                    params[params.length - 1],  // body
                    params[0],                  // box
                    params[1]                   // key
                ];
                sql = 'SELECT upsert_avar($1, $2, $3)';
                if (params.length === 4) {
                    args.push(params[2]);
                    sql = 'SELECT upsert_task($1, $2, $3, $4)';
                }
                client.query(sql, args, function (err) {
                 // This function actually receives a second `results`
                 // parameter, but because `callback` won't use it, we ignore
                 // it here to avoid "unused variable" errors in JS linters.
                    done();
                    return callback(err);
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
                var lines = [

                    'CREATE TABLE IF NOT EXISTS avars (',
                    '   body TEXT NOT NULL,',
                    '   box TEXT NOT NULL,',
                    '   key TEXT NOT NULL,',
                    '   last_touch TIMESTAMP NOT NULL DEFAULT NOW(),',
                    '   status TEXT,',
                    '   PRIMARY KEY (box, key)',
                    ');',

                 /*
                    'DO',
                    '$$',
                    'BEGIN',
                    '   IF NOT EXISTS (',
                    '       SELECT  1',
                    '       FROM    pg_class c',
                    '       JOIN    pg_namespace n ON n.oid = c.relnamespace',
                    '       WHERE   c.relname = \'jobs\'',
                    '       AND     n.nspname = \'public\'',
                    '       ) THEN',
                    '       CREATE INDEX jobs ON public.avars (box, status);',
                    '   END IF;',
                    '   IF NOT EXISTS (',
                    '       SELECT  1',
                    '       FROM    pg_class c',
                    '       JOIN    pg_namespace n ON n.oid = c.relnamespace',
                    '       WHERE   c.relname = \'ltouch\'',
                    '       AND     n.nspname = \'public\'',
                    '       ) THEN',
                    '       CREATE INDEX ltouch ON public.avars (last_touch);',
                    '   END IF;',
                    'END',
                    '$$',
                    'language plpgsql;',
                 */

                    'CREATE OR REPLACE FUNCTION evict_old_avars() ' +
                        'RETURNS trigger AS',
                    '$$',
                    'BEGIN',
                    '   DELETE FROM avars',
                    '   WHERE last_touch < NOW() - INTERVAL \'' +
                            settings.avar_ttl + ' seconds\';',
                    '   RETURN NEW;',
                    'END;',
                    '$$',
                    'language plpgsql;',

                    'DROP TRIGGER IF EXISTS avar_gc ON avars;',
                    'CREATE TRIGGER avar_gc',
                    '   AFTER INSERT ON avars',
                    '   EXECUTE PROCEDURE evict_old_avars();',

                    'CREATE OR REPLACE FUNCTION upsert_avar' +
                        '(body2 TEXT, box2 TEXT, key2 TEXT) RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = body2,' +
                        '           last_touch = NOW(),' +
                        '           status = NULL',
                    '           WHERE box = box2 AND key = key2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars (body, box, key)',
                    '               VALUES (body2, box2, key2);',
                    '           RETURN;',
                    '       EXCEPTION WHEN unique_violation THEN',
                    '       END;',
                    '   END LOOP;',
                    'END;',
                    '$$',
                    'LANGUAGE plpgsql;',

                    'CREATE OR REPLACE FUNCTION upsert_task' +
                        '(body2 TEXT, box2 TEXT, key2 TEXT, status2 TEXT) ' +
                        'RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = body2,' +
                        '           last_touch = NOW(),' +
                        '           status = status2',
                    '           WHERE box = box2 AND key = key2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars (body, box, key, status)',
                    '               VALUES (body2, box2, key2, status2);',
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
                    console.log('API: PostgreSQL storage is ready.');
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

    exports.log = function (settings) {
     // This function needs documentation.
        var connection_string = settings.trafficlog_storage.postgres;
        pg.connect(connection_string, function (err, client, done) {
         // This function needs documentation.
            if (err !== null) {
                done();
                throw err;
            }
            if (cluster.isWorker) {
                done();
                return;
            }
            var lines;
            lines = [
                'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
                'CREATE TABLE IF NOT EXISTS traffic (',
                '   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),',
                '   doc json NOT NULL',
                ');'
            ];
            client.query(lines.join('\n'), function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                console.log('LOG: PostgreSQL storage is ready.');
                done();
                return;
            });
            return;
        });
        return function (obj) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    throw err;
                }
                var doc, sql;
                doc = JSON.stringify(obj);
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
