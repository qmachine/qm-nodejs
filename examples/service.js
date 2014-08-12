//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 26 Sep 2012
//                                                  ~~ last updated 12 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        avar_ttl, couch, cpus, enable_api_server, enable_CORS,
        enable_web_server, env, gc_interval, launch_service, length,
        max_http_sockets, mongo, persistent_storage, postgres, redis, sqlite,
        trafficlog_storage, USER, worker_procs
    */

 // Declarations

    var examples, qm;

 // Definitions

    examples = {
        max_http_sockets:   1000,
        persistent_storage: {
            avar_ttl:       60,
            couch:          'http://127.0.0.1:5984/db',
            gc_interval:    1,
            mongo:          'mongodb://localhost:27017/qm',
            postgres:       'postgres://localhost:5432/' + process.env.USER,
            redis:          'redis://:@127.0.0.1:6379',
            sqlite:         'qm.db'
        },
        trafficlog_storage: {
            couch:          'http://127.0.0.1:5984/traffic',
            mongo:          'mongodb://localhost:27017/qm',
            postgres:       'postgres://localhost:5432/' + process.env.USER
        },
        worker_procs:       require('os').cpus().length
    };

    qm = require('../');

 // Invocations

    qm.launch_service({
        enable_api_server:  true,
        enable_CORS:        true,
        enable_web_server:  false,
        persistent_storage: {
            avar_ttl:       60,
            mongo:          examples.persistent_storage.mongo
        },
        trafficlog_storage: {
            //mongo:          examples.trafficlog_storage.mongo
        },
        worker_procs:       0
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
