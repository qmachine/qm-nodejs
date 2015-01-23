//- JavaScript source code

//- qm.js ~~
//                                                      ~~ (c) SRW, 16 Jul 2012
//                                                  ~~ last updated 23 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        launch, launch_client, launch_service, roll_up, version
    */

 // Out-of-scope definitions

    exports.launch_client = require('./qm/client').launch;

    exports.launch_service = require('./qm/service').launch;

    exports.roll_up = require('./qm/katamari').roll_up;

    exports.version = require('../package.json').version;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
