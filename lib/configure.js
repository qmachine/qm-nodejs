//- JavaScript source code

//- configure.js ~~
//                                                      ~~ (c) SRW, 17 Dec 2012
//                                                  ~~ last updated 13 Aug 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties exports, hasOwnProperty */

 // Out-of-scope definitions

    module.exports = function configure(user_input, default_values) {
     // This function deep-copies the properties of the `default_values` object
     // onto a fresh output object `y` recursively, but it will prefer to copy
     // a property from the `user_input` object when available.
        if ((user_input instanceof Object) === false) {
            user_input = {};
        }
        var key, y;
        y = (default_values instanceof Array) ? [] : user_input;
        for (key in default_values) {
            if (default_values.hasOwnProperty(key)) {
                if (default_values[key] instanceof Object) {
                    y[key] = configure(user_input[key], default_values[key]);
                } else if (user_input.hasOwnProperty(key)) {
                    y[key] = user_input[key];
                } else {
                    y[key] = default_values[key];
                }
            }
        }
        return y;
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
