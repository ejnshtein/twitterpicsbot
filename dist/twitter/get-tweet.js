"use strict";
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
exports.getDBTweet = exports.getTweet = void 0;
var _1 = require(".");
var sleep_js_1 = require("../lib/sleep.js");
var Tweet_js_1 = require("../models/Tweet.js");
var twimo_1 = require("@yarnaimo/twimo");
var getTweetFromTwitter = function (tweetId) { return twimo_1.lookupTweets(_1.twimo, [tweetId]).then(function (_a) {
    var tweet = _a[0];
    return tweet;
}); };
var getAggregationTweetQuery = function (tweetId, fromId) { return [
    {
        $match: {
            tweet_id: tweetId
        }
    },
    {
        $addFields: {
            added: {
                $in: [
                    fromId,
                    '$users'
                ]
            }
        }
    },
    {
        $project: {
            'tweet.extended_entities.media': 1,
            'tweet.user': 1,
            'tweet.id_str': 1,
            'tweet.created_at': 1,
            added: 1,
            tweet_id: 1,
            created_at: 1
        }
    }
]; };
exports.getTweet = function (_a) {
    var tweetId = _a.tweetId, fromId = _a.fromId, privateMode = _a.privateMode;
    return __awaiter(void 0, void 0, void 0, function () {
        var state, tweetInDb, tweet, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = _1.store.getState();
                    return [4 /*yield*/, Tweet_js_1.TweetModel.aggregate(getAggregationTweetQuery(tweetId, fromId))];
                case 1:
                    tweetInDb = (_b.sent())[0];
                    if (!tweetInDb) return [3 /*break*/, 4];
                    if (!(!privateMode && !tweetInDb.added)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Tweet_js_1.TweetModel.updateOne({
                            tweet_id: tweetId
                        }, {
                            $addToSet: {
                                users: fromId
                            }
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, {
                        ok: true,
                        tweet: tweetInDb.tweet
                    }];
                case 4:
                    if (!(state.remaining > 0)) return [3 /*break*/, 13];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 11, , 12]);
                    return [4 /*yield*/, getTweetFromTwitter(tweetId)];
                case 6:
                    tweet = _b.sent();
                    return [4 /*yield*/, Tweet_js_1.TweetModel.create({
                            tweet_id: tweetId,
                            tweet: tweet
                        })];
                case 7:
                    _b.sent();
                    if (!!privateMode) return [3 /*break*/, 9];
                    return [4 /*yield*/, Tweet_js_1.TweetModel.updateOne({ tweet_id: tweetId }, {
                            $addToSet: {
                                users: fromId
                            }
                        })];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [4 /*yield*/, sleep_js_1.default(1000)];
                case 10:
                    _b.sent();
                    _1.reduceRemaining();
                    return [2 /*return*/, {
                            ok: true,
                            tweet: tweet
                        }];
                case 11:
                    e_1 = _b.sent();
                    return [2 /*return*/, {
                            ok: false,
                            tweet: null,
                            type: 'error',
                            error: e_1
                        }];
                case 12: return [3 /*break*/, 14];
                case 13: return [2 /*return*/, {
                        tweet: null,
                        ok: false,
                        type: 'limit exceeded',
                        wait: Date.now() - state.reset.getTime()
                    }];
                case 14: return [2 /*return*/];
            }
        });
    });
};
exports.getDBTweet = function (_a) {
    var tweetId = _a.tweetId, fromId = _a.fromId, privateMode = _a.privateMode;
    return __awaiter(void 0, void 0, void 0, function () {
        var state, tweetInDb, tweet, newdbtweet, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = _1.store.getState();
                    return [4 /*yield*/, Tweet_js_1.TweetModel.aggregate(getAggregationTweetQuery(tweetId, fromId))];
                case 1:
                    tweetInDb = (_b.sent())[0];
                    if (!tweetInDb) return [3 /*break*/, 4];
                    if (!(!privateMode && !tweetInDb.added)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Tweet_js_1.TweetModel.updateOne({
                            tweet_id: tweetId
                        }, {
                            $addToSet: {
                                users: fromId
                            }
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, tweetInDb];
                case 4:
                    if (!(state.remaining > 0)) return [3 /*break*/, 13];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 11, , 12]);
                    return [4 /*yield*/, getTweetFromTwitter(tweetId)];
                case 6:
                    tweet = _b.sent();
                    return [4 /*yield*/, Tweet_js_1.TweetModel.create({
                            tweet_id: tweetId,
                            tweet: tweet
                        })];
                case 7:
                    newdbtweet = _b.sent();
                    if (!!privateMode) return [3 /*break*/, 9];
                    return [4 /*yield*/, Tweet_js_1.TweetModel.updateOne({ tweet_id: tweetId }, {
                            $addToSet: {
                                users: fromId
                            }
                        })];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [4 /*yield*/, sleep_js_1.default(1000)];
                case 10:
                    _b.sent();
                    _1.reduceRemaining();
                    return [2 /*return*/, {
                            tweet: newdbtweet.tweet,
                            tweet_id: tweetId,
                            added: privateMode
                        }];
                case 11:
                    e_2 = _b.sent();
                    return [2 /*return*/, e_2];
                case 12: return [3 /*break*/, 14];
                case 13: return [2 /*return*/, "Limit exceeded, please wait " + (Date.now() - state.reset.getTime())];
                case 14: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=get-tweet.js.map