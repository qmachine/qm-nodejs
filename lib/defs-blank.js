//- JavaScript source code

//- defs-blank.js ~~
//
//  This file contains the "blank" interface for QM 1.2's storage definitions.
//
//                                                      ~~ (c) SRW, 07 Aug 2014
//                                                  ~~ last updated 28 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api, api_db, api_defs, get_avar, get_jobs, init_api_store,
        init_log_store, log, log_db, log_defs, set_avar
    */

 // Declarations

    var cluster, get_avar, get_jobs, init_api, init_log, log, set_avar, state;

 // Definitions

    cluster = require('cluster');

    get_avar = function (params, callback) {
     // This function retrieves an avar's representation if it exists, and it
     // also updates the "expiration date" of the avar in the database so that
     // data still being used for computations will not be removed.
        // ...
        return;
    };

    get_jobs = function (params, callback) {
     // This function retrieves an array of avar keys.
        // ...
        return;
    };

    init_api = function (params, callback) {
     // This function establishes a connection to the database for master and
     // worker processes, and it stores a reference to the connection to
     // `state.api_db`. Then, if this is a master process, the function
     // configures the database by ensuring indexes, storing procedures, etc.
        // ...
        return;
    };

    init_log = function (params, callback) {
     // This function establishes a connection to the database for master and
     // worker processes, and it stores a reference to the connection to
     // `state.log_db`. Then, if this is a master process, the function
     // configures the database by ensuring indexes, storing procedures, etc.
        // ...
        return;
    };

    log = function (params, callback) {
     // This function needs documentation.
        // ...
        return;
    };

    set_avar = function (params, callback) {
     // This function upserts an avar's representation in the database. It also
     // updates the "expiration date" of the avar in the database so that data
     // still being used for computations will not be removed.
        // ...
        return;
    };

    state = {
        api_db: null,
        log_db: null
    };

 // Out-of-scope definitions

    exports = {
        get_avar: function (params, callback) {
         // This function needs documentation.
            throw new Error('Missing `get_avar` definition.');
        },
        get_jobs: function (params, callback) {
         // This function needs documentation.
            throw new Error('Missing `get_list` definition.');
        },
        init_api_store: function (params, callback) {
         // This function needs documentation.
            throw new Error('Missing `init_api_store` definition.');
        },
        init_log_store: function (params, callback) {
         // This function needs documentation.
            throw new Error('Missing `init_log_store` definition.');
        },
        log: function (params, callback) {
         // This function needs documentation.
            throw new Error('Missing `log` definition.');
        },
        set_avar: function (params, callback) {
         // This function needs documentation.
            throw new Error('Missing `set_avar` definition.');
        }
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
