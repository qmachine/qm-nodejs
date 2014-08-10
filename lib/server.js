//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 14 Jul 2014
//                                                  ~~ last updated 10 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        api_store, hasOwnProperty, init, log_store
    */

 // Declarations

    var configure, get_avar, get_list, hang_up, is_Function, launch, log,
        set_avar, warn;

 // Definitions

    configure = function (user_spec, defaults) {
     // This function needs documentation.
        var options;
        options = {};
        // ...
        return options;
    };

    get_avar = function (params, callback) {
     // This function needs documentation.
        throw new Error('Missing `get_avar` definition.');
    };

    get_list = function (params, callback) {
     // This function needs documentation.
        throw new Error('Missing `get_list` definition.');
    };

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

    launch = function (options) {
     // This function needs documentation.
        var api_str, conf, log_str;

        conf = configure(options, {
         // (default options go here)
        });

        if (conf.api_store.hasOwnProperty('couch')) {
            api_str = './defs-couch';
        } else if (conf.api_store.hasOwnProperty('mongo')) {
            api_str = './defs-mongo';
        } else if (conf.api_store.hasOwnProperty('postgres')) {
            api_str = './defs-postgres';
        } else if (conf.api_store.hasOwnProperty('redis')) {
            api_str = './defs-redis';
        } else if (conf.api_store.hasOwnProperty('sqlite')) {
            api_str = './defs-sqlite';
        }

        if (conf.log_store.hasOwnProperty('couch')) {
            log_str = './defs-couch';
        } else if (conf.log_store.hasOwnProperty('mongo')) {
            log_str = './defs-mongo';
        } else if (conf.log_store.hasOwnProperty('postgres')) {
            log_str = './defs-postgres';
        } else if (conf.log_store.hasOwnProperty('redis')) {
            log_str = './defs-redis';
        } else if (conf.log_store.hasOwnProperty('sqlite')) {
            log_str = './defs-sqlite';
        }

        require(api_str).api_store.init(conf, function (err, defs) {
         // This function needs documentation.
            // ...
            return;
        });

        require(log_str).log_store.init(conf, function (err, defs) {
         // This function needs documentation.
            // ...
            return;
        });

        return;
    };

    log = function (message) {
     // This function needs documentation.
        // ...
        return;
    };

    set_avar = function (params, callback) {
     // This function needs documentation.
        throw new Error('Missing `set_avar` definition.');
    };

 // Prototype definitions

 // Out-of-scope definitions

    // ...

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
