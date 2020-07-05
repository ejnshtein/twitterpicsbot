"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(timeout) {
    return new Promise(function (resolve) { return setTimeout(resolve, timeout); });
}
exports.default = sleep;
//# sourceMappingURL=sleep.js.map