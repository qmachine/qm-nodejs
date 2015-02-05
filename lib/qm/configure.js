//- JavaScript source code

//- configure.js ~~
//                                                      ~~ (c) SRW, 17 Dec 2012
//                                                  ~~ last updated 04 Feb 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties exports, hasOwnProperty, join, test */

 // Out-of-scope definitions

    module.exports = function configure(user_input, default_values) {
     // This function deep-copies the properties of the `default_values` object
     // onto a fresh output object `y` recursively, but it will prefer to copy
     // a property from the `user_input` object when available.
        if ((user_input instanceof Object) === false) {
            user_input = {};
        }
        var key, y;
     // The following line looks like sloppy typing, but it is important that
     // `user_input` not be replaced by `{}` unless default choices are always
     // given. For example, `persistent_storage` and `trafficlog_storage` are
     // just empty objects by default, which means that no storage could ever
     // be specified under the current scheme.
        y = (default_values instanceof Array) ? [] : user_input;
        for (key in default_values) {
            if (default_values.hasOwnProperty(key)) {
                if ((default_values[key] instanceof Object) &&
                        (typeof default_values[key] !== 'function')) {
                    y[key] = configure(user_input[key], default_values[key]);
                } else if (user_input.hasOwnProperty(key)) {
                 // Try to match types on a basic level for primitives when a
                 // a default type is known. The coercions shown below work for
                 // all input types, and they still manage to pass JSLint :-P
                    switch (typeof default_values[key]) {
                    case 'boolean':
                        y[key] = (/^true$/).test(user_input[key]);
                        break;
                    case 'number':
                        y[key] = parseFloat(user_input[key], 10);
                        break;
                    case 'string':
                        y[key] = ['', user_input[key]].join('');
                        break;
                    default:
                        y[key] = user_input[key];
                    }
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
