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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.reduceRemaining = exports.twimo = void 0;
var effector_1 = require("effector");
var node_schedule_1 = require("node-schedule");
var env_js_1 = require("../env.js");
var twimo_1 = require("@yarnaimo/twimo");
exports.twimo = twimo_1.Twimo({
    consumerKey: env_js_1.default.TWITTER_CONSUMER_KEY,
    consumerSecret: env_js_1.default.TWITTER_CONSUMER_SECRET
})({
    token: env_js_1.default.TWITTER_ACCESS_TOKEN_KEY,
    tokenSecret: env_js_1.default.TWITTER_ACCESS_TOKEN_SECRET
});
var getLimits = function () { return twimo_1.twget(exports.twimo, 'application/rate_limit_status'); };
var fetchLimits = effector_1.createEffect('get limits', {
    handler: function () {
        return __awaiter(this, void 0, void 0, function () {
            var limits, _a, reset, limit, remaining;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, getLimits()];
                    case 1:
                        limits = _b.sent();
                        _a = limits.resources.statuses['/statuses/show/:id'], reset = _a.reset, limit = _a.limit, remaining = _a.remaining;
                        return [2 /*return*/, {
                                reset: new Date(reset * 1000),
                                limit: limit,
                                remaining: remaining
                            }];
                }
            });
        });
    }
});
var resetJob = fetchLimits.done.map(function (_a) {
    var result = _a.result;
    return result.reset;
});
exports.reduceRemaining = effector_1.createEvent('reduce remaining');
exports.store = effector_1.createStore({
    limit: 180,
    remaining: 180,
    reset: new Date(Date.now() + (15 * 1000)),
    job: node_schedule_1.scheduleJob(new Date(Date.now() + (15 * 1000)), function () { return fetchLimits(); })
})
    .on(fetchLimits.done, function (state, _a) {
    var _b = _a.result, limit = _b.limit, reset = _b.reset, remaining = _b.remaining;
    return (__assign(__assign({}, state), { limit: limit,
        reset: reset,
        remaining: remaining }));
})
    .on(resetJob, function (state, reset) {
    state.job.reschedule(reset.toUTCString());
    return state;
})
    .on(exports.reduceRemaining, function (state) { return (__assign(__assign({}, state), { remaining: state.remaining > 1 ? state.remaining - 1 : 0 })); });
fetchLimits();
//# sourceMappingURL=index.js.map