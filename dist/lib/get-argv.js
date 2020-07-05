"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getArgv(name) {
    var id = process.argv.indexOf(name);
    if (id !== -1) {
        return process.argv[id + 1];
    }
    return undefined;
}
exports.default = getArgv;
//# sourceMappingURL=get-argv.js.map