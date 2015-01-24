//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 24 Nov 2012
//                                                  ~~ last updated 21 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api, apply, avar_ttl, box, buffer, cmd, collect_garbage, Connection,
        connection, 'Content-Length', 'content-length', 'Content-Type', create,
        createServer, Date, enable_api_server, enable_cors, enable_web_server,
        end, error, fork, gc_interval, get_avar, get_list, globalAgent,
        handler, hasOwnProperty, headers, host, hostname, 'if-modified-since',
        isMaster, isWorker, join, key, keys, last_mod_date, 'Last-Modified',
        last_modified, launch, length, listen, log, match, match_hostname,
        max_body_size, max_http_sockets, maxSockets, method, mime_type, on,
        parse, pattern, persistent_storage, pid, port, push, replace, set_avar,
        slice, sort, split, sqlite, static_content, status, stringify, test,
        timestamp, toString, toUTCString, trafficlog_storage, unroll, url,
        warn, worker_procs, writeHead, 'x-forwarded-for'
    */

 // Declarations

    var cluster, collect_garbage, configure, corser, http, // is_Function,
        katamari, spawn_workers, warn;

 // Definitions

    cluster = require('cluster');

    collect_garbage = function (f, options) {
     // This function needs documentation.
        if (cluster.isWorker) {
            return;
        }
     /*
        if (options.hasOwnProperty('gc_interval') === false) {
            throw new Error('WTF');
        }
     */
        setInterval(f, options.gc_interval * 1000);
        return;
    };

    configure = require('./configure');

    corser = require('corser');

    http = require('http');

 /*
    is_Function = function (f) {
     // This function returns `true` if and only if input argument `f` is a
     // function. The second condition is necessary to avoid a false positive
     // in a pre-ES5 environment when `f` is a regular expression. Since we
     // know that Node.js supports ES5, it probably isn't necessary, but it's
     // not causing a bottleneck or anything ...
        return ((typeof f === 'function') && (f instanceof Function));
    };
 */

    katamari = require('./katamari');

    spawn_workers = function (n) {
     // This function needs documentation.
        var spawn_worker;
        spawn_worker = function () {
         // This function needs documentation.
            var worker = cluster.fork();
            worker.on('error', function (err) {
             // This function needs documentation.
                console.error(err);
                return;
            });
            worker.on('message', function (message) {
             // This function needs documentation.
                console.log(worker.pid + ':', message.cmd);
                return;
            });
            return worker;
        };
        if ((cluster.isMaster) && (n > 0)) {
            cluster.on('exit', function (prev_worker) {
             // This function needs documentation.
                var next_worker = spawn_worker();
                console.log(prev_worker.pid + ':', 'RIP', next_worker.pid);
                return;
            });
            while (n > 0) {
                spawn_worker();
                n -= 1;
            }
        }
        return;
    };

    warn = function (lines) {
     // This function needs documentation.
        var text;
        text = lines.join(' ').replace(/([\w\-\:\,\.\s]{65,79})\s/g, '$1\n');
        console.warn('\n%s\n', text);
        return;
    };

 // Out-of-scope definitions

    exports.launch = function (obj) {
     // This function needs documentation.
        /*jslint unparam: true */
        var config, corse, defs, hang_up, log, rules, save, server,
            static_content;
        config = configure(obj, {
            avar_ttl:           86400,      //- expire avars after 24 hours
            enable_api_server:  false,
            enable_cors:        false,
            enable_web_server:  false,
            gc_interval:        60,         //- evict old avars every _ seconds
            hostname:           '0.0.0.0',  //- aka INADDR_ANY
            log: function (request) {
             // This function is the default logging function.
                return {
                    host: request.headers.host,
                    method: request.method,
                    timestamp: new Date(),
                    url: request.url
                };
            },
            match_hostname:     false,
            max_body_size:      65536,      //- 64 * 1024 -> 64 KB (see docs)
            max_http_sockets:   500,
            persistent_storage: {},
            port:               8177,
            static_content:     'katamari.json',
            trafficlog_storage: {},
            worker_procs:       1
        });
        config.worker_procs = parseInt(config.worker_procs, 10);
        if ((config.enable_api_server === false) &&
                (config.enable_web_server === false)) {
         // Exit early if the configuration is underspecified.
            warn(['No servers specified.']);
            return;
        }
        hang_up = function (response) {
         // This function simulates "hangs up" on the request by responding
         // with a nondescript 444 status code and an empty body. Ideally, it
         // would literally hang up by closing the connection, but there are a
         // lot of subtleties with "keep-alive" that need to be worked out ...
            response.writeHead(444, {
                //'Connection': 'close',
                //'Content-Length': 0,
                //'Content-Type': 'text/plain'
            });
            response.end();
            return;
        };
        log = function (request) {
         // This function delegates to the user-specified `config.log` :-)
            save(config.log(request));
            return;
        };
        rules = [];
        if (config.trafficlog_storage.hasOwnProperty('couch')) {
            save = require('./defs-couch').log(config);
        } else if (config.trafficlog_storage.hasOwnProperty('mongo')) {
            save = require('./defs-mongo').log(config);
        } else if (config.trafficlog_storage.hasOwnProperty('postgres')) {
            save = require('./defs-postgres').log(config);
        } else {
            save = function (obj) {
             // This function prints traffic data to stdout. It alphabetizes
             // the keys to make debugging easier on human eyes, but it prints
             // JSON as a single line to make parsing easier for programs.
             /*
                var i, keys, n, temp;
                keys = Object.keys(obj).sort();
                n = keys.length;
                temp = {};
                for (i = 0; i < n; i += 1) {
                    temp[keys[i]] = obj[keys[i]];
                }
                console.log(JSON.stringify(temp));
             */
                console.log(JSON.stringify(obj));
                return;
            };
        }
        if (config.enable_cors === true) {
            corse = corser.create({});
            server = http.createServer(function (request, response) {
             // This function needs documentation.
                if ((config.match_hostname === true) &&
                        (request.headers.host !== config.hostname)) {
                    hang_up(response);
                    return;
                }
                corse(request, response, function () {
                 // This function needs documentation.
                    var flag, i, n, params, rule, url;
                    flag = false;
                    n = rules.length;
                    url = request.url;
                    for (i = 0; (flag === false) && (i < n); i += 1) {
                        rule = rules[i];
                        if ((request.method === rule.method) &&
                                (rule.pattern.test(url))) {
                            flag = true;
                            params = url.match(rule.pattern).slice(1);
                            rule.handler(request, response, params);
                        }
                    }
                    if (flag === true) {
                        log(request);
                    } else {
                        hang_up(response);
                    }
                    return;
                });
                return;
            });
            rules.push({
                method:  'OPTIONS',
                pattern: /^\//,
                handler: function (request, response) {
                 // This function supports CORS preflight for all routes.
                    response.writeHead(204);
                    response.end();
                    return;
                }
            });
        } else {
            server = http.createServer(function (request, response) {
             // This function needs documentation.
                if ((config.match_hostname === true) &&
                        (request.headers.host !== config.hostname)) {
                    hang_up(response);
                    return;
                }
                var flag, i, n, params, rule, url;
                flag = false;
                n = rules.length;
                url = request.url;
                for (i = 0; (flag === false) && (i < n); i += 1) {
                    rule = rules[i];
                    if ((request.method === rule.method) &&
                            (rule.pattern.test(url))) {
                        flag = true;
                        params = url.match(rule.pattern).slice(1);
                        rule.handler(request, response, params);
                    }
                }
                if (flag === true) {
                    log(request);
                } else {
                    hang_up(response);
                }
                return;
            });
        }
        if (config.enable_api_server === true) {
         // This part makes my eyes bleed, but it works really well.
            if (config.persistent_storage.hasOwnProperty('couch')) {
                defs = require('./defs-couch').api(config);
            } else if (config.persistent_storage.hasOwnProperty('mongo')) {
                if ((config.max_body_size > 4194304) && (cluster.isMaster)) {
                    warn([
                        'WARNING: Older versions of MongoDB cannot save',
                        'documents greater than 4MB (when converted to BSON).',
                        'Consider setting a smaller "max_body_size".'
                    ]);
                }
                defs = require('./defs-mongo').api(config);
            } else if (config.persistent_storage.hasOwnProperty('postgres')) {
                defs = require('./defs-postgres').api(config);
            } else if (config.persistent_storage.hasOwnProperty('redis')) {
                defs = require('./defs-redis').api(config);
            } else if (config.persistent_storage.hasOwnProperty('sqlite')) {
                if ((config.persistent_storage.sqlite === ':memory:') &&
                        (cluster.isMaster) && (config.worker_procs > 0)) {
                    warn([
                        'WARNING: In-memory SQLite databases do not provide',
                        'shared persistent storage because each worker will',
                        'create and use its own individual database. Thus,',
                        'you should expect your API server to behave',
                        'erratically at best.'
                    ]);
                }
                defs = require('./defs-sqlite').api(config);
            } else {
                throw new Error('No persistent storage was specified.');
            }
         // These are mainly here for debugging at the moment ...
         /*
            if (is_Function(defs.collect_garbage) === false) {
                throw new TypeError('No `collect_garbage` method is defined.');
            }
            if (is_Function(defs.get_avar) === false) {
                throw new TypeError('No `get_avar` method is defined.');
            }
            if (is_Function(defs.get_list) === false) {
                throw new TypeError('No `get_list` method is defined.');
            }
            if (is_Function(defs.set_avar) === false) {
                throw new TypeError('No `set_avar` method is defined.');
            }
         */
            rules.push({
                method:  'GET',
                pattern: /^\/(?:box|v1)\/([\w\-]+)\?key=([\w\-]+)$/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback;
                    callback = function (err, results) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                        }
                        if (typeof results !== 'string') {
                            results = '{}';
                        }
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        response.end(results);
                        return;
                    };
                    defs.get_avar(params, callback);
                    return;
                }
            });
            rules.push({
                method:  'GET',
                pattern: /^\/(?:box|v1)\/([\w\-]+)\?status=([\w\-]+)$/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback;
                    callback = function (err, results) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                        }
                        if ((results instanceof Array) === false) {
                            results = [];
                        }
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify(results));
                        return;
                    };
                    defs.get_list(params, callback);
                    return;
                }
            });
            rules.push({
                method:  'POST',
                pattern: /^\/(?:box|v1)\/([\w\-]+)\?key=([\w\-]+)$/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback, headers, temp;
                    callback = function (err) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                            hang_up(response);
                            return;
                        }
                        response.writeHead(201, {
                            'Content-Type': 'text/plain'
                        });
                        response.end();
                        return;
                    };
                    headers = request.headers;
                    if (headers.hasOwnProperty('content-length')  === false) {
                        callback('Missing "content-length" header');
                        return;
                    }
                    if (headers['content-length'] > config.max_body_size) {
                        callback('Maximum file upload size exceeded');
                        return;
                    }
                    temp = [];
                    request.on('data', function (chunk) {
                     // This function needs documentation.
                        temp.push(chunk.toString());
                        return;
                    });
                    request.on('end', function () {
                     // This function needs documentation.
                        var body, box, key, obj2;
                        body = temp.join('');
                        box = params[0];
                        key = params[1];
                        try {
                            obj2 = JSON.parse(body);
                        } catch (err) {
                            callback(err);
                            return;
                        }
                        if ((obj2.box !== box) || (obj2.key !== key)) {
                            callback('Mismatched JSON properties');
                            return;
                        }
                        if (typeof obj2.status === 'string') {
                            if ((/^[\w\-]+$/).test(obj2.status) === false) {
                                callback('Invalid "status" string');
                                return;
                            }
                            params.push(obj2.status);
                        }
                        params.push(body);
                        defs.set_avar(params, callback);
                        return;
                    });
                    return;
                }
            });
            if (config.enable_web_server === false) {
             // If this is a standalone API server, then the "robots.txt" file
             // won't be present.
                rules.push({
                    method:  'GET',
                    pattern: /^\/robots\.txt$/,
                    handler: function (request, response) {
                     // This function returns a bare-minimum "robots.txt" file.
                        response.writeHead(200, {
                            'Content-Type': 'text/plain'
                        });
                        response.end('User-agent: *\nDisallow: /\n');
                        return;
                    }
                });
            }
            collect_garbage(defs.collect_garbage, config.persistent_storage);
        }
        if (config.enable_web_server === true) {
            static_content = katamari.unroll(config.static_content);
            rules.push({
                method:  'GET',
                pattern: /^(\/[\w\-\.]*)/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var headers, name, resource, temp;
                    headers = request.headers;
                    name = (params[0] === '/') ? '/index.html' : params[0];
                    if (static_content.hasOwnProperty(name) === false) {
                        hang_up(response);
                        return;
                    }
                    resource = static_content[name];
                    if (headers.hasOwnProperty('if-modified-since')) {
                        try {
                            temp = new Date(headers['if-modified-since']);
                        } catch (err) {
                            hang_up(response);
                            return;
                        }
                        if (resource.last_mod_date <= temp) {
                            response.writeHead(304, {
                             // NOTE: Remove next line? (http://goo.gl/j8ltE9)
                                'Date': (new Date()).toUTCString()
                            });
                            response.end();
                            return;
                        }
                    }
                    response.writeHead(200, {
                        'Content-Type': resource.mime_type,
                     // NOTE: Remove next line? (http://goo.gl/j8ltE9)
                        'Date': (new Date()).toUTCString(),
                        'Last-Modified': resource.last_modified
                    });
                    response.end(resource.buffer);
                    return;
                }
            });
        }
        if ((cluster.isMaster) && (config.worker_procs > 0)) {
            spawn_workers(config.worker_procs);
            server = null;
            return;
        }
        http.globalAgent.maxSockets = config.max_http_sockets;
        server.on('error', function (message) {
         // This function needs documentation.
            console.error('Server error:', message);
            return;
        });
        server.listen(config.port, config.hostname, function () {
         // This function needs documentation.
            console.log('QM up -> http://%s:%d ...',
                    config.hostname, config.port);
            return;
        });
        return;
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
