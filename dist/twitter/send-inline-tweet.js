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
exports.sendInlineTweet = void 0;
var get_tweet_1 = require("./get-tweet");
var get_thumb_url_1 = require("../lib/get-thumb-url");
var get_video_url_1 = require("../lib/get-video-url");
exports.sendInlineTweet = function (id, ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var results, options, _a, error, tweet, type, wait, entities, user, _i, _b, entitie, _c, mime_type, video_url;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                results = [];
                options = {
                    cache_time: 5
                };
                return [4 /*yield*/, get_tweet_1.getTweet({
                        tweetId: id,
                        fromId: ctx.from.id,
                        privateMode: ctx.state.user.private_mode
                    })];
            case 1:
                _a = _d.sent(), error = _a.error, tweet = _a.tweet, type = _a.type, wait = _a.wait;
                switch (true) {
                    case error instanceof Error: {
                        throw error;
                    }
                    case type === 'limit exceeded': {
                        throw new Error("Exceeded the number of requests, please wait " + Math.floor(wait / 1000) + " minutes");
                    }
                }
                entities = tweet.extended_entities;
                user = tweet.user;
                options.switch_pm_parameter = "" + id;
                options.switch_pm_text = "Get media" + (entities.media.length > 1 ? " (" + entities.media.length + ")" : '');
                for (_i = 0, _b = entities.media; _i < _b.length; _i++) {
                    entitie = _b[_i];
                    if (entitie.type === 'photo') {
                        results.push({
                            type: 'photo',
                            id: entitie.id_str,
                            photo_url: get_thumb_url_1.getThumbUrl(entitie.media_url_https, 'large', 'jpg'),
                            thumb_url: get_thumb_url_1.getThumbUrl(entitie.media_url_https),
                            photo_height: entitie.sizes.large.h,
                            photo_width: entitie.sizes.large.w,
                            title: "" + user.name,
                            caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>",
                            parse_mode: 'HTML'
                        });
                    }
                    else if (entitie.type === 'video') {
                        _c = get_video_url_1.default(entitie.video_info), mime_type = _c.mime_type, video_url = _c.video_url;
                        results.push({
                            type: 'video',
                            video_url: video_url,
                            mime_type: mime_type,
                            thumb_url: entitie.media_url_https,
                            title: "" + user.name,
                            id: entitie.id_str,
                            caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>",
                            parse_mode: 'HTML'
                        });
                    }
                    else if (entitie.type === 'animated_git') {
                        results.push({
                            type: 'gif',
                            id: entitie.id_str,
                            gif_url: entitie.video_info.variants.pop().url,
                            thumb_url: entitie.media_url_https,
                            title: "" + user.name,
                            caption: "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>",
                            parse_mode: 'HTML'
                        });
                    }
                }
                return [2 /*return*/, {
                        options: options,
                        results: results
                    }];
        }
    });
}); };
//# sourceMappingURL=send-inline-tweet.js.map