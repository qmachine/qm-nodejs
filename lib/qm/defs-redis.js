//- JavaScript source code

//- defs-redis.js ~~
//
//  The first step here was just to get things running with plain old arrays in
//  JavaScript, and I accomplished that. The next step is to jettison anything
//  that hinders performance, since it's downright sinful to choose a platform
//  like Node.js + Redis and then squander cycles needlessly ...
//
//                                                      ~~ (c) SRW, 23 Nov 2012
//                                                  ~~ last updated 05 Apr 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api, auth, avar_ttl, body, ceil, collect_garbage, createClient,
        detect_buffers, enable_offline_queue, error, exec, exists, expire,
        forEach, get_avar, get_list, hget, hmset, hostname, isMaster, keys,
        length, log, multi, no_ready_check, on, parse, parser,
        persistent_storage, port, quit, redis, replace, return_buffers, sadd,
        set_avar, smembers, socket_nodelay, split, srem, status, stringify
    */

 // Declarations

    var cluster, redis, url;

 // Definitions

    cluster = require('cluster');

    redis = require('redis');

    url = require('url');

 // Out-of-scope definitions

    exports.api = function (settings) {
     // This function needs documentation.
        var collect_garbage, conn, db, exp_date, get_avar, get_list, set_avar;

        collect_garbage = function () {
         // This function needs documentation.
            var remaining, seek_and_destroy;
            seek_and_destroy = function (queue) {
             // This function needs documentation.
                var box = queue.replace(/^\$\:([\w\-]+)[&][\w\-]+/, '$1');
                db.smembers(queue, function (err, response) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                        return;
                    }
                    var callback, n;
                    callback = function () {
                     // This function needs documentation.
                        n -= 1;
                        if (n === 0) {
                            remaining -= 1;
                            if (remaining === 0) {
                                console.log('Finished collecting garbage.');
                            }
                        }
                        return;
                    };
                    n = response.length;
                    response.forEach(function (key) {
                     // This function needs documentation.
                        db.exists(box + '&' + key, function (err, response) {
                         // This function needs documentation.
                            if (err !== null) {
                                console.error('Error:', err);
                            }
                            if (response === 0) {
                                db.srem(queue, key, function (err) {
                                 // This function accepts a second argument,
                                 // but I have omitted it because it irritates
                                 // JSLint et al. otherwise.
                                    if (err !== null) {
                                        console.error('Error:', err);
                                    }
                                    return callback();
                                });
                            } else {
                                callback();
                            }
                            return;
                        });
                        return;
                    });
                    if (n === 0) {
                        callback();
                    }
                    return;
                });
                return;
            };
            db.keys('$:*', function (err, queues) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                remaining = queues.length;
                queues.forEach(seek_and_destroy);
                if (remaining === 0) {
                    console.log('Finished collecting garbage.');
                }
                return;
            });
            return;
        };

        conn = url.parse(settings.persistent_storage.redis);

        db = redis.createClient(conn.port, conn.hostname, {
         // For more information, see http://git.io/PRZ7Bw .
            detect_buffers: false,
            enable_offline_queue: true,
            no_ready_check: true,
            //parser: 'hiredis',
            return_buffers: false,
            socket_nodelay: true
        });

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil(settings.avar_ttl);
        };

        get_avar = function (params, callback) {
         // This function needs documentation.
            db.hget(params[0] + '&' + params[1], 'body', function (err, body) {
             // This function needs documentation.
                if (err === null) { // NOT A MISTAKE -- it means it was found.
                 // Postpone eviction
                    db.expire(params[0] + '&' + params[1], exp_date());
                }
                return callback(err, body);
            });
            return;
        };

        get_list = function (params, callback) {
         // This function needs documentation.
            db.smembers('$:' + params[0] + '&' + params[1], function (err, x) {
             // This function needs documentation.
                var y = (x instanceof Array) ? JSON.stringify(x) : '[]';
                return callback(err, y);
            });
            return;
        };

        set_avar = function (params, callback) {
         // This function needs documentation.
            var body, box, key;
            body = params[params.length - 1];
            box = params[0];
            key = params[1];
            db.hget(box + '&' + key, 'status', function (err, res) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, res);
                }
                var multi, set1, set2, updated;
                multi = db.multi();
                updated = {'body': body};
                if (res !== null) {
                    set1 = '$:' + box + '&' + res;
                    multi.srem(set1, key);
                }
                if (params.length === 4) {
                    updated.status = params[2];
                    set2 = '$:' + box + '&' + updated.status;
                    multi.sadd(set2, key);
                }
                multi.hmset(box + '&' + key, updated);
                multi.expire(box + '&' + key, exp_date());
                multi.exec(callback);
                return;
            });
            return;
        };

        if (typeof conn.auth === 'string') {
            db.auth(conn.auth.split(':')[1]);
        }

        db.on('connect', function () {
         // This function needs documentation.
            if (cluster.isMaster) {
                console.log('API: Redis storage is ready.');
            }
            return;
        });

        db.on('end', function () {
         // This function needs documentation.
            console.log('(Redis client closed)');
            return;
        });

        db.on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });

        process.on('exit', function () {
         // This function needs documentation.
            db.quit();
            console.log('(Redis client released)');
            return;
        });

        return {
            collect_garbage: collect_garbage,
            get_avar: get_avar,
            get_list: get_list,
            set_avar: set_avar
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
