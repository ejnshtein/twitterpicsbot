"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotevn = require("dotenv");
var dotenvParseVariables = require("dotenv-parse-variables");
var argv_js_1 = require("./lib/argv.js");
if (!process.env) {
    var env = dotevn.config({
        path: './.env'
    });
    var variables = dotenvParseVariables(env.parsed);
    process.env = variables;
}
else {
    if (!argv_js_1.default('--heroku')) {
        var env = dotevn.config({
            path: './.env'
        });
        var variables = dotenvParseVariables(env.parsed);
        process.env = __assign(__assign({}, process.env), variables);
    }
}
exports.default = process.env;
//# sourceMappingURL=env.js.map