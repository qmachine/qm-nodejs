//- JavaScript source code

//- paas-utils.js ~~
//
//  This file contains functions that can be useful when deploying QMachine on
//  Platform-as-a-Service.
//
//                                                      ~~ (c) SRW, 24 Jan 2015
//                                                  ~~ last updated 24 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties env, parse, replace */

 // Module definitions

    exports.parse = function (x) {
     // This function is extremely useful for Platform-as-a-Service because it
     // enables environment variables to reference other environment variables
     // inside of JSON, such as for '{"mongo":"${MONGODB_URI}"}' :-)
        return JSON.parse(x, function (key, val) {
         // This function needs documentation.
            /*jslint unparam: true */
            if (typeof val === 'string') {
                return val.replace(/[$][{]([A-Z0-9_]+)[}]/g, function ($0, $1) {
                 // This function needs documentation.
                    return process.env[$1];
                });
            }
            return val;
        });
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
