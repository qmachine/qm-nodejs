//- JavaScript source code

//- server.js ~~
//
//  This is a sketch of the new interfaces that QM 1.2 will use. I haven't
//  decided whether or not to use Quanah to replace callbacks or not.
//
//                                                      ~~ (c) SRW, 14 Jul 2014
//                                                  ~~ last updated 29 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api_store, cmd, enable_api_server, enable_cors, enable_web_server,
        error, fork, get_avar, get_jobs, hasOwnProperty, hostname,
        init_api_store, init_log_store, isMaster, isWorker, launch_server, log,
        log_store, on, pid, port, set_avar, worker_procs
    */

 // Declarations

    var cluster, configure, db, hang_up, is_Function, load_storage_defs, log,
        run_master, run_worker, warn;

 // Definitions

    cluster = require('cluster');

    configure = require('./configure');

    db = require('./defs-blank');

    hang_up = function (request, response) {
     // This function needs documentation.
        // ...
        return;
    };

    is_Function = function (f) {
     // This function returns `true` if and only if input argument `f` is a
     // function. The second condition is necessary to avoid a false positive
     // in a pre-ES5 environment when `f` is a regular expression.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    load_storage_defs = function (config) {
     // This function needs documentation.
        var api_defs, log_defs;

        if (config.api_store.hasOwnProperty('couch')) {
            api_defs = require('./defs-couch');
        } else if (config.api_store.hasOwnProperty('mongo')) {
            api_defs = require('./defs-mongo');
        } else if (config.api_store.hasOwnProperty('postgres')) {
            api_defs = require('./defs-postgres');
        } else if (config.api_store.hasOwnProperty('redis')) {
            api_defs = require('./defs-redis');
        } else if (config.api_store.hasOwnProperty('sqlite')) {
            api_defs = require('./defs-sqlite');
        } else {
            api_defs = require('./defs-blank');
        }

        db.get_avar = api_defs.get_avar;
        db.get_jobs = api_defs.get_jobs;
        db.init_api_store = api_defs.init_api_store;
        db.set_avar = api_defs.set_avar;

        if (config.log_store.hasOwnProperty('couch')) {
            log_defs = require('./defs-couch');
        } else if (config.log_store.hasOwnProperty('mongo')) {
            log_defs = require('./defs-mongo');
        } else if (config.log_store.hasOwnProperty('postgres')) {
            log_defs = require('./defs-postgres');
        } else if (config.log_store.hasOwnProperty('redis')) {
            log_defs = require('./defs-redis');
        } else if (config.log_store.hasOwnProperty('sqlite')) {
            log_defs = require('./defs-sqlite');
        } else {
            log_defs = require('./defs-blank');
        }

        db.init_log_store = log_defs.init_log_store;
        db.log = log_defs.log;
        return;
    };

    log = function (message) {
     // This function needs documentation.
        // ...
        return;
    };

    run_master = function (config) {
     // This function is run by the master process to ensure it runs only once.
     // It initializes the API and log storage and spawns the worker processes.
        var spawn_workers;
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
        db.init_api_store(config);
        db.init_log_store(config);
        spawn_workers(config.worker_procs);
        return;
    };

    run_worker = function (config) {
     // This function needs documentation.
        // ...
        return;
    };

    warn = function (message) {
     // This function needs documentation.
        // ...
        return;
    };

 // Out-of-scope definitions

    exports.launch_server = function (options) {
     // This function needs documentation.
        var config;
        config = configure(options, {
         // Default options:
            enable_api_server:  false,
            enable_cors:        false,
            enable_web_server:  false,
            hostname:           '0.0.0.0',  //- aka INADDR_ANY
            port:               8177,
            worker_procs:       0
        });
        if (config.enable_api_server || config.enable_web_server) {
            load_storage_defs(config);
        } else {
         // Exit early if the configuration is underspecified.
            warn('No servers specified.');
            return;
        }
        if (cluster.isMaster) {
            run_master(config);
        }
        if (cluster.isWorker || (config.worker_procs === 0)) {
            run_worker(config);
        }
        return;
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
