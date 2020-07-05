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
exports.sendMedia = void 0;
var get_tweet_1 = require("./get-tweet");
var get_thumb_url_1 = require("../lib/get-thumb-url");
var get_video_url_1 = require("../lib/get-video-url");
var templates_1 = require("../lib/templates");
var send_tweets_1 = require("./send-tweets");
exports.sendMedia = function (ctx, _a) {
    var tweetIds = _a.tweetIds;
    return __awaiter(void 0, void 0, void 0, function () {
        var _i, tweetIds_1, tweetId, _b, tweet, error, type, wait, _c, entities, user, i, _d, _e, entitie, _f, video_url, mime_type;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _i = 0, tweetIds_1 = tweetIds;
                    _g.label = 1;
                case 1:
                    if (!(_i < tweetIds_1.length)) return [3 /*break*/, 17];
                    tweetId = tweetIds_1[_i];
                    return [4 /*yield*/, get_tweet_1.getTweet({
                            tweetId: tweetId,
                            fromId: ctx.from.id,
                            privateMode: ctx.state.user.private_mode
                        })];
                case 2:
                    _b = _g.sent(), tweet = _b.tweet, error = _b.error, type = _b.type, wait = _b.wait;
                    _c = true;
                    switch (_c) {
                        case error instanceof Error: return [3 /*break*/, 3];
                        case type === 'limit exceeded': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 3: return [4 /*yield*/, ctx.reply(templates_1.templates.error(error))];
                case 4:
                    _g.sent();
                    return [2 /*return*/];
                case 5: return [4 /*yield*/, ctx.reply(send_tweets_1.onLimitExceeded({
                        tweets: tweetIds.map(function (id) { return [undefined, id]; }),
                        wait: wait
                    }))];
                case 6:
                    _g.sent();
                    return [2 /*return*/];
                case 7:
                    entities = tweet.extended_entities;
                    user = tweet.user;
                    i = 0;
                    _d = 0, _e = entities.media;
                    _g.label = 8;
                case 8:
                    if (!(_d < _e.length)) return [3 /*break*/, 16];
                    entitie = _e[_d];
                    if (!(entitie.type === 'photo')) return [3 /*break*/, 10];
                    return [4 /*yield*/, ctx.replyWithDocument({
                            filename: user.screen_name + "-" + tweetId + "-photo-" + i + ".jpg",
                            url: get_thumb_url_1.getThumbUrl(entitie.media_url_https, 'large', 'jpg')
                        }, {
                            caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + user.name + "</a> photo" + (entities.media.length > 1 ? " (" + (i + 1) + "/" + entities.media.length + ")" : ''),
                            thumb: get_thumb_url_1.getThumbUrl(entitie.media_url_https),
                            parse_mode: 'HTML'
                        })];
                case 9:
                    _g.sent();
                    return [3 /*break*/, 14];
                case 10:
                    if (!(entitie.type === 'video')) return [3 /*break*/, 12];
                    _f = get_video_url_1.default(entitie.video_info), video_url = _f.video_url, mime_type = _f.mime_type;
                    return [4 /*yield*/, ctx.replyWithDocument({
                            filename: user.screen_name + "-" + tweetId + "-video-" + i + "." + mime_type,
                            url: video_url
                        }, {
                            caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + user.name + "</a> video" + (entities.media.length > 1 ? " (" + (i + 1) + "/" + entities.media.length + ")" : ''),
                            thumb: get_thumb_url_1.getThumbUrl(entitie.media_url_https),
                            parse_mode: 'HTML'
                        })];
                case 11:
                    _g.sent();
                    return [3 /*break*/, 14];
                case 12:
                    if (!(entitie.type === 'animated_gif')) return [3 /*break*/, 14];
                    return [4 /*yield*/, ctx.replyWithDocument({
                            filename: user.screen_name + "-" + tweetId + "-gif-" + i + ".gif",
                            url: entitie.video_info.variants.pop().url
                        }, {
                            caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + user.name + "</a> gif" + (entities.media.length > 1 ? " (" + (i + 1) + "/" + entities.media.length + ")" : ''),
                            thumb: get_thumb_url_1.getThumbUrl(entitie.media_url_https),
                            parse_mode: 'HTML'
                        })];
                case 13:
                    _g.sent();
                    _g.label = 14;
                case 14:
                    i++;
                    _g.label = 15;
                case 15:
                    _d++;
                    return [3 /*break*/, 8];
                case 16:
                    _i++;
                    return [3 /*break*/, 1];
                case 17: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=send-media.js.map