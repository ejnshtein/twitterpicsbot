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
exports.sendTweets = exports.findLastIndex = exports.onLimitExceeded = void 0;
var get_tweet_1 = require("./get-tweet");
var sleep_1 = require("../lib/sleep");
var get_video_url_1 = require("../lib/get-video-url");
var get_thumb_url_1 = require("../lib/get-thumb-url");
var templates_1 = require("../lib/templates");
exports.onLimitExceeded = function (_a) {
    var tweets = _a.tweets, wait = _a.wait;
    var text = "Exceeded the number of requests, please wait " + Math.floor(wait / 1000) + " ms.";
    return text + "\n\nTweets list:\n" + tweets.map(function (_a) {
        var url = _a[0];
        return url;
    }).join('\n');
};
exports.findLastIndex = function (arr, fn) { return (arr
    .map(function (val, i) { return [i, val]; })
    .filter(function (res) {
    var i = res[0], val = res[1];
    return fn(val, i, arr);
})
    .pop() || [-1])[0]; };
exports.sendTweets = function (ctx, _a) {
    var text = _a.text, tweetIds = _a.tweetIds, messageId = _a.messageId;
    return __awaiter(void 0, void 0, void 0, function () {
        var chat, from, state, reply, telegram, replyWithMediaGroup, replyWithAnimation, results, sentTweets, tweets, originalTweetsLength, initialOptions, msg, _loop_1, _i, tweets_1, _b, _, tweetId, _loop_2, _c, _d, result, _e, _f, error, sentTweetsLength, getLostTweets, messageText, keyboard, finalOptions;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    chat = ctx.chat, from = ctx.from, state = ctx.state, reply = ctx.reply, telegram = ctx.telegram, replyWithMediaGroup = ctx.replyWithMediaGroup, replyWithAnimation = ctx.replyWithAnimation;
                    results = [];
                    sentTweets = [];
                    tweets = text
                        ? text.match(/twitter\.com\/.+\/status\/[0-9]+/ig)
                            .map(function (tweet) { return tweet.match(/twitter\.com\/\S+\/status\/([0-9]+)/i); })
                        : tweetIds
                            .map(function (tweetId) { return ["https://twitter.com/web/status/" + tweetId, tweetId]; });
                    originalTweetsLength = tweets.length;
                    initialOptions = {};
                    if (messageId) {
                        initialOptions.reply_to_message_id = messageId;
                    }
                    return [4 /*yield*/, reply("Processing " + tweets.length + " tweet" + (tweets.length > 1 ? 's' : '') + "...", initialOptions)];
                case 1:
                    msg = _g.sent();
                    _loop_1 = function (_, tweetId) {
                        var _a, error, tweet, type, wait, entities, isInMedia, user, images_1, lastAlbumIndex, addNewAlbum, lastAlbum, lastMediaId, videos_1, lastAlbumIndex, addNewAlbum, lastAlbum, lastMediaId, gifs, _i, gifs_1, gif;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, get_tweet_1.getTweet({
                                        tweetId: tweetId,
                                        fromId: from.id,
                                        privateMode: state.user.private_mode
                                    })];
                                case 1:
                                    _a = _b.sent(), error = _a.error, tweet = _a.tweet, type = _a.type, wait = _a.wait;
                                    switch (type) {
                                        case 'error': {
                                            results.push({
                                                _: 'error',
                                                ids: [tweetId],
                                                error: error
                                            });
                                            break;
                                        }
                                        case 'limit exceeded': {
                                            throw new Error(exports.onLimitExceeded({ tweets: tweets, wait: wait }));
                                        }
                                    }
                                    entities = tweet.extended_entities;
                                    isInMedia = function (mediaType) { return entities.media.some(function (_a) {
                                        var type = _a.type;
                                        return type === mediaType;
                                    }); };
                                    user = tweet.user;
                                    if (isInMedia('photo')) {
                                        images_1 = entities.media
                                            .filter(function (_a) {
                                            var type = _a.type;
                                            return type === 'photo';
                                        })
                                            .map(function (image) { return ({
                                            type: 'photo',
                                            thumb: get_thumb_url_1.getThumbUrl(image.media_url_https),
                                            url: get_thumb_url_1.getThumbUrl(image.media_url_https, 'large')
                                        }); });
                                        lastAlbumIndex = exports.findLastIndex(results, function (el) { return el._ === 'album'; });
                                        addNewAlbum = function () {
                                            results.push({
                                                _: 'album',
                                                ids: [tweetId],
                                                media: [].concat(images_1),
                                                caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + (images_1.length > 1 ? "1-" + images_1.length : "" + (tweets.length > 1 ? '1' : '')) + " " + user.name + "</a>"
                                            });
                                        };
                                        if (lastAlbumIndex >= 0) {
                                            lastAlbum = results[lastAlbumIndex];
                                            if (lastAlbum.media.length >= 0 &&
                                                lastAlbum.media.length < 10 &&
                                                lastAlbum.media.length + images_1.length <= 10) {
                                                lastMediaId = lastAlbum.media.length;
                                                lastAlbum.media = lastAlbum.media.concat(images_1);
                                                lastAlbum.ids.push(tweetId);
                                                lastAlbum.caption += "\n<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + (lastMediaId + 1) + (images_1.length > 1 ? "-" + (lastMediaId + images_1.length) : '') + " " + user.name + "</a>";
                                            }
                                            else {
                                                addNewAlbum();
                                            }
                                        }
                                        else {
                                            addNewAlbum();
                                        }
                                    }
                                    if (isInMedia('video')) {
                                        videos_1 = entities.media
                                            .filter(function (_a) {
                                            var type = _a.type;
                                            return type === 'video';
                                        })
                                            .map(function (video) {
                                            var video_url = get_video_url_1.default(video.video_info).video_url;
                                            return {
                                                type: 'video',
                                                url: video_url,
                                                thumb: get_thumb_url_1.getThumbUrl(video.media_url_https)
                                            };
                                        });
                                        lastAlbumIndex = exports.findLastIndex(results, function (el) { return el._ === 'album'; });
                                        addNewAlbum = function () {
                                            results.push({
                                                _: 'album',
                                                ids: [tweetId],
                                                media: [].concat(videos_1),
                                                caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + (videos_1.length > 1 ? "1-" + videos_1.length : "" + (tweets.length > 1 ? '1' : '')) + " " + user.name + "</a>"
                                            });
                                        };
                                        if (lastAlbumIndex >= 0) {
                                            lastAlbum = results[lastAlbumIndex];
                                            if (lastAlbum.media.length >= 0 &&
                                                lastAlbum.media.length < 10 &&
                                                lastAlbum.media.length + videos_1.length <= 10) {
                                                lastMediaId = lastAlbum.media.length;
                                                lastAlbum.media = lastAlbum.media.concat(videos_1);
                                                lastAlbum.ids.push(tweetId);
                                                lastAlbum.caption += "\n<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + (lastMediaId + 1) + (videos_1.length > 1 ? "-" + (lastMediaId + videos_1.length) : "" + (tweets.length > 1 ? '1' : '')) + " " + user.name + "</a>";
                                            }
                                            else {
                                                addNewAlbum();
                                            }
                                        }
                                        else {
                                            addNewAlbum();
                                        }
                                    }
                                    if (isInMedia('animated_gif')) {
                                        gifs = entities.media
                                            .filter(function (_a) {
                                            var type = _a.type;
                                            return type === 'animated_gif';
                                        })
                                            .map(function (gif) { return ({
                                            type: 'gif',
                                            url: gif.video_info.variants.pop().url,
                                            thumb: get_thumb_url_1.getThumbUrl(gif.media_url_https)
                                        }); });
                                        for (_i = 0, gifs_1 = gifs; _i < gifs_1.length; _i++) {
                                            gif = gifs_1[_i];
                                            results.push({
                                                _: 'gif',
                                                ids: [tweetId],
                                                media: [gif],
                                                caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweetId + "\">" + user.name + "</a>"
                                            });
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, tweets_1 = tweets;
                    _g.label = 2;
                case 2:
                    if (!(_i < tweets_1.length)) return [3 /*break*/, 5];
                    _b = tweets_1[_i], _ = _b[0], tweetId = _b[1];
                    return [5 /*yield**/, _loop_1(_, tweetId)];
                case 3:
                    _g.sent();
                    _g.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _loop_2 = function (result) {
                        var _a, _b, url, thumb, caption;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = result._;
                                    switch (_a) {
                                        case 'album': return [3 /*break*/, 1];
                                        case 'gif': return [3 /*break*/, 3];
                                    }
                                    return [3 /*break*/, 5];
                                case 1: return [4 /*yield*/, replyWithMediaGroup(result.media.map(function (m, index) { return ({
                                        type: m.type,
                                        media: m.url,
                                        caption: index === 0 ? result.caption : undefined,
                                        parse_mode: 'HTML'
                                    }); }))];
                                case 2:
                                    _c.sent();
                                    return [3 /*break*/, 5];
                                case 3:
                                    _b = result.media[0], url = _b.url, thumb = _b.thumb;
                                    caption = result.caption;
                                    return [4 /*yield*/, replyWithAnimation(url, {
                                            caption: caption,
                                            thumb: thumb,
                                            parse_mode: 'HTML'
                                        })];
                                case 4:
                                    _c.sent();
                                    return [3 /*break*/, 5];
                                case 5:
                                    result.ids.forEach(function (id) { return sentTweets.push(id); });
                                    return [4 /*yield*/, sleep_1.default(1000)];
                                case 6:
                                    _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _c = 0, _d = results.filter(function (_a) {
                        var _ = _a._;
                        return _ !== 'error';
                    });
                    _g.label = 6;
                case 6:
                    if (!(_c < _d.length)) return [3 /*break*/, 9];
                    result = _d[_c];
                    return [5 /*yield**/, _loop_2(result)];
                case 7:
                    _g.sent();
                    _g.label = 8;
                case 8:
                    _c++;
                    return [3 /*break*/, 6];
                case 9:
                    _e = 0, _f = (results.filter(function (_a) {
                        var _ = _a._;
                        return _ === 'error';
                    }));
                    _g.label = 10;
                case 10:
                    if (!(_e < _f.length)) return [3 /*break*/, 14];
                    error = _f[_e].error;
                    return [4 /*yield*/, reply(templates_1.templates.error(error))];
                case 11:
                    _g.sent();
                    return [4 /*yield*/, sleep_1.default(1000)];
                case 12:
                    _g.sent();
                    _g.label = 13;
                case 13:
                    _e++;
                    return [3 /*break*/, 10];
                case 14:
                    sentTweetsLength = sentTweets.length;
                    getLostTweets = function () { return tweets
                        .filter(function (_a) {
                        var _ = _a[0], tweetId1 = _a[1];
                        return !sentTweets.some(function (tweetId) { return tweetId === tweetId1; });
                    })
                        .map(function (_a) {
                        var _ = _a[0];
                        return _;
                    })
                        .join('\n'); };
                    messageText = "\n    Received " + originalTweetsLength + " tweet" + (originalTweetsLength > 1 ? 's' : '') + "\n    Sent " + sentTweetsLength + " tweet" + (sentTweetsLength > 1 ? 's' : '') + "\n    Your success - " + ((sentTweetsLength / originalTweetsLength) * 100).toFixed(0) + "%\n    " + (originalTweetsLength - sentTweetsLength > 0 ? "Lost tweets (Probably they do not contain photos, videos, gifs or API access can be disabled by author.):\n" + getLostTweets() : '') + "\n    ";
                    keyboard = [
                        [
                            {
                                text: 'ok',
                                callback_data: 'delete'
                            },
                            {
                                text: 'Get as files',
                                callback_data: 'getfiles'
                            }
                        ]
                    ];
                    if (originalTweetsLength - sentTweetsLength) {
                        keyboard.push([
                            {
                                text: 'Resend lost tweets',
                                callback_data: 'tweets'
                            }
                        ]);
                    }
                    finalOptions = {
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: keyboard
                        }
                    };
                    if (messageId) {
                        finalOptions.reply_to_message_id = messageId;
                    }
                    return [4 /*yield*/, reply(messageText, finalOptions)];
                case 15:
                    _g.sent();
                    return [4 /*yield*/, telegram.deleteMessage(chat.id, msg.message_id)];
                case 16:
                    _g.sent();
                    return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=send-tweets.js.map