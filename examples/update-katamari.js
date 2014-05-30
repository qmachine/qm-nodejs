//- JavaScript source code

//- update-katamari.js ~~
//
//  Example usage: $ node examples/update-katamari.js k1.json k2.json
//
//                                                      ~~ (c) SRW, 29 Sep 2013
//                                                  ~~ last updated 29 May 2014

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var fs, update_katamari;

 // Definitions

    fs = require('fs');

    update_katamari = function (xname, yname) {
     // This function "updates" an old katamari by modifying the new katamari
     // in-place to use original timestamps where content has not changed.
        var flag, key, tx, ty, x, y;
        x = require(xname);
        y = require(yname);
        for (key in y) {
            if (y.hasOwnProperty(key)) {
                if (x.hasOwnProperty(key)) {
                    flag = ((x[key].base64 === y[key].base64) &&
                            (x[key].mime_type === y[key].mime_type));
                    if (flag === true) {
                        tx = new Date(x[key].last_modified);
                        ty = new Date(y[key].last_modified);
                        if (tx < ty) {
                            console.log('Using original', key, '...');
                            y[key] = x[key];
                        } else {
                            console.log('Same', key, 'already ...');
                        }
                    } else {
                        console.log('Different', key, '...');
                    }
                } else {
                    console.log('Adding ', key, '...');
                }
            }
        }
        fs.writeFile(yname, JSON.stringify(y), function (err) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            console.log('Saved to "' + yname + '".');
            return;
        });
        return;
    };

 // Invocations

    if (process.argv.length !== 4) {
        console.error('Incorrect number of arguments.');
        return process.exit(1);
    }

    if (typeof process.argv[2] !== 'string') {
        console.error('"Second" argument should be a string.');
        return process.exit(1);
    }

    if (typeof process.argv[3] !== 'string') {
        console.error('"Third" argument should be a string.');
        return process.exit(1);
    }

    update_katamari(process.argv[2], process.argv[3]);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
