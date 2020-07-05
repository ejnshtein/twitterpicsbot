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
var telegraf_1 = require("telegraf");
var bot_1 = require("../bot");
var get_video_url_1 = require("../lib/get-video-url");
var get_thumb_url_1 = require("../lib/get-thumb-url");
var Tweet_1 = require("../models/Tweet");
var send_error_1 = require("../inline/send-error");
var send_inline_tweet_1 = require("../twitter/send-inline-tweet");
var composer = new telegraf_1.Composer();
var catchThrow = function (fn) { return function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 4]);
                return [4 /*yield*/, fn(ctx)];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                e_1 = _a.sent();
                console.log(e_1);
                return [4 /*yield*/, ctx.answerInlineQuery([send_error_1.sendError(e_1)])];
            case 3:
                _a.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }; };
composer.inlineQuery([
    /twitter\.com\/\S+\/status\/([0-9]+)/i,
    /^\S+\/([0-9]+)$/i,
    /^([0-9]+)$/i
], function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _, tweetId, _b, results, options, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = ctx.match, _ = _a[0], tweetId = _a[1];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, send_inline_tweet_1.sendInlineTweet(tweetId, ctx)];
            case 2:
                _b = _c.sent(), results = _b.results, options = _b.options;
                return [4 /*yield*/, ctx.answerInlineQuery(results, options)];
            case 3:
                _c.sent();
                return [3 /*break*/, 5];
            case 4:
                e_2 = _c.sent();
                console.log(e_2);
                return [2 /*return*/, ctx.answerInlineQuery([send_error_1.sendError(e_2)])];
            case 5: return [2 /*return*/];
        }
    });
}); });
composer.on('inline_query', catchThrow(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userQuery, skip, aggregationQuery, result, next_offset, inlineQueryResults, options, _i, result_1, tweet, user, entities, _a, _b, entitie, _c, mime_type, video_url;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (ctx.inlineQuery.offset === 'none') {
                    return [2 /*return*/, ctx.answerInlineQuery([])];
                }
                query = {
                    users: ctx.from.id,
                    'tweet.extended_entities.media': { $exists: true }
                };
                userQuery = ctx.inlineQuery.query;
                if (userQuery.includes('-u')) {
                    query['tweet.user.screen_name'] = new RegExp(userQuery.replace('-u', '').trim(), 'i');
                }
                else if (userQuery) {
                    query['tweet.text'] = new RegExp(userQuery, 'i');
                }
                skip = ctx.inlineQuery.offset === ''
                    ? 0
                    : ctx.inlineQuery.offset === 'none'
                        ? undefined
                        : Number.parseInt(ctx.inlineQuery.offset);
                aggregationQuery = [
                    {
                        $match: query
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ];
                if (skip && skip > 0) {
                    aggregationQuery.push({
                        $skip: skip * 12
                    });
                }
                aggregationQuery.push({
                    $limit: 12
                });
                return [4 /*yield*/, Tweet_1.TweetModel.aggregate(aggregationQuery)];
            case 1:
                result = _d.sent();
                next_offset = result.length < 12 ? 'none' : "" + (skip + 1);
                inlineQueryResults = [];
                options = {
                    cache_time: 5,
                    is_personal: false,
                    next_offset: next_offset
                };
                if (ctx.state.user.private_mode) {
                    options.is_personal = true;
                    options.cache_time = 30;
                }
                for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                    tweet = result_1[_i].tweet;
                    user = tweet.user;
                    entities = tweet.extended_entities;
                    for (_a = 0, _b = entities.media; _a < _b.length; _a++) {
                        entitie = _b[_a];
                        if (entitie.type === 'photo') {
                            inlineQueryResults.push({
                                type: 'photo',
                                id: entitie.id_str,
                                photo_url: get_thumb_url_1.getThumbUrl(entitie.media_url_https, 'large', 'jpg'),
                                thumb_url: get_thumb_url_1.getThumbUrl(entitie.media_url_https),
                                thumb_height: entitie.sizes.thumb.h,
                                thumb_width: entitie.sizes.thumb.w,
                                photo_height: entitie.sizes.large.h,
                                photo_width: entitie.sizes.large.w,
                                title: "" + user.name,
                                caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>",
                                parse_mode: 'HTML'
                            });
                        }
                        else if (entitie.type === 'video') {
                            _c = get_video_url_1.default(entitie.video_info), mime_type = _c.mime_type, video_url = _c.video_url;
                            inlineQueryResults.push({
                                type: 'video',
                                video_url: video_url,
                                mime_type: mime_type,
                                // thumb_url: `${entitie.media_url_https}:thumb`,
                                thumb_url: get_thumb_url_1.getThumbUrl(entitie.media_url_https),
                                thumb_height: entitie.sizes.thumb.h,
                                thumb_width: entitie.sizes.thumb.w,
                                title: "" + user.name,
                                video_duration: Math.floor(entitie.video_info.duration_millis / 1000),
                                description: tweet.full_text,
                                id: entitie.id_str,
                                caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>",
                                parse_mode: 'HTML'
                            });
                        }
                        else if (entitie.type === 'animated_gif') {
                            inlineQueryResults.push({
                                type: 'gif',
                                id: entitie.id_str,
                                gif_url: entitie.video_info.variants.pop().url,
                                thumb_url: entitie.media_url_https,
                                thumb_height: entitie.sizes.thumb.h,
                                thumb_width: entitie.sizes.thumb.w,
                                title: "" + user.name,
                                caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>",
                                parse_mode: 'HTML'
                            });
                        }
                    }
                }
                return [2 /*return*/, ctx.answerInlineQuery(inlineQueryResults, options)];
        }
    });
}); }));
bot_1.bot.use(composer.middleware());
//# sourceMappingURL=inline-query.js.map