//- JavaScript source code

//- roll-up.js ~~
//
//  NOTE: This file isn't just an example -- it is also used as part of the
//  QMachine project's unit tests :-)
//
//                                                      ~~ (c) SRW, 17 Dec 2012
//                                                  ~~ last updated 21 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties argv, length, roll_up */

 // Declarations

    var directory, json_file;

 // Definitions

    directory = (process.argv.length > 2) ? process.argv[2] : 'public';

    json_file = (process.argv.length > 3) ? process.argv[3] : 'katamari.json';

 // Demonstration

    require('../').roll_up(directory, json_file);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
