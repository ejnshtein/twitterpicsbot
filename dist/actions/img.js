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
var get_tweet_1 = require("../twitter/get-tweet");
var bot_1 = require("../bot");
var templates_1 = require("../lib/templates");
var composer = new telegraf_1.Composer();
composer.action([
    /allimg:\S+\/([0-9]+)/i,
    /allimg:([0-9]+)/i
], telegraf_1.Composer.privateChat(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _, tweetId, _b, error, tweet, type, wait, images, user;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = ctx.match, _ = _a[0], tweetId = _a[1];
                return [4 /*yield*/, get_tweet_1.getTweet({
                        tweetId: tweetId,
                        fromId: ctx.from.id,
                        privateMode: ctx.state.user.private_mode
                    })];
            case 1:
                _b = _c.sent(), error = _b.error, tweet = _b.tweet, type = _b.type, wait = _b.wait;
                if (error) {
                    throw ctx.answerCbQuery(templates_1.templates.error(error), true);
                }
                if (type === 'limit exceeded') {
                    return [2 /*return*/, ctx.answerCbQuery("Exceeded the number of requests, please wait " + Math.floor(wait / 1000) + " minutes", true)];
                }
                images = tweet.extended_entities.media
                    .filter(function (_a) {
                    var type = _a.type;
                    return type === 'photo';
                })
                    .map(function (_a) {
                    var media_url_https = _a.media_url_https;
                    return media_url_https;
                });
                user = tweet.user;
                if (!(images.length > 1)) return [3 /*break*/, 4];
                return [4 /*yield*/, ctx.replyWithMediaGroup(images.map(function (imgUrl, index) { return ({
                        type: 'photo',
                        media: imgUrl,
                        caption: index === 0 ? "<a href=\"https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str + "\">" + user.name + "</a>" : '',
                        parse_mode: 'HTML'
                    }); }))];
            case 2:
                _c.sent();
                return [4 /*yield*/, ctx.deleteMessage()];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4:
                ctx.answerCbQuery('');
                return [2 /*return*/];
        }
    });
}); }));
bot_1.bot.use(composer.middleware());
//# sourceMappingURL=img.js.map