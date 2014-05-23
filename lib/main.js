//- JavaScript source code

//- main.js ~~
//                                                      ~~ (c) SRW, 16 Jul 2012
//                                                  ~~ last updated 23 May 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

 // Out-of-scope definitions

    exports.launch_client = require('./client').launch;

    exports.launch_service = require('./service').launch;

    exports.roll_up = require('./katamari').roll_up;

    exports.version = require('../package.json').version;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
