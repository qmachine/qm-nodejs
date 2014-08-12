//- JavaScript source code

//- client.js ~~
//                                                      ~~ (c) SRW, 28 Jun 2012
//                                                  ~~ last updated 12 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties hostname, launch_client, port */

 // Declarations

    var qm;

 // Definitions

    qm = require('../');

 // Invocations

    qm.launch_client({
        hostname:   '127.0.0.1',
        port:       8177
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
