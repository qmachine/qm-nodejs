//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 14 Jul 2014
//                                                  ~~ last updated 28 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api_store, get_avar, get_jobs, hasOwnProperty, init_api_store,
        init_log_store, isMaster, isWorker, launch_server, log, log_store,
        set_avar, worker_procs
    */

 // Declarations

    var cluster, configure, db, hang_up, is_Function, load_api_defs,
        load_log_defs, log, run_master, run_worker, warn;

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

    load_api_defs = function (config) {
     // This function needs documentation.
        var defs;
        if (config.api_store.hasOwnProperty('couch')) {
            defs = require('./defs-couch');
        } else if (config.api_store.hasOwnProperty('mongo')) {
            defs = require('./defs-mongo');
        } else if (config.api_store.hasOwnProperty('postgres')) {
            defs = require('./defs-postgres');
        } else if (config.api_store.hasOwnProperty('redis')) {
            defs = require('./defs-redis');
        } else if (config.api_store.hasOwnProperty('sqlite')) {
            defs = require('./defs-sqlite');
        } else {
            defs = require('./defs-blank');
        }
        db.get_avar = defs.get_avar;
        db.get_jobs = defs.get_jobs;
        db.init_api_store = defs.init_api_store;
        db.set_avar = defs.set_avar;
        return;
    };

    load_log_defs = function (config) {
     // This function needs documentation.
        var defs;
        if (config.log_store.hasOwnProperty('couch')) {
            defs = require('./defs-couch');
        } else if (config.log_store.hasOwnProperty('mongo')) {
            defs = require('./defs-mongo');
        } else if (config.log_store.hasOwnProperty('postgres')) {
            defs = require('./defs-postgres');
        } else if (config.log_store.hasOwnProperty('redis')) {
            defs = require('./defs-redis');
        } else if (config.log_store.hasOwnProperty('sqlite')) {
            defs = require('./defs-sqlite');
        } else {
            defs = require('./defs-blank');
        }
        db.init_log_store = defs.init_log_store;
        db.log = defs.log;
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
        // ...
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
            worker_procs: 0
        });
        load_api_defs(config);
        load_log_defs(config);
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
