"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
var mongoose = require("mongoose");
var env_js_1 = require("./env.js");
var createConnection = mongoose.createConnection;
exports.connection = createConnection(env_js_1.default.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
});
exports.connection.then(function () {
    console.log('DB connected');
});
exports.connection.catch(function (e) {
    console.log('DB error', e);
});
//# sourceMappingURL=database.js.map