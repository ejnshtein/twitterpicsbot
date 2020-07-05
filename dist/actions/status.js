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
var date_fns_1 = require("date-fns");
var date_fns_timezone_1 = require("date-fns-timezone");
var bot_1 = require("../bot");
var User_1 = require("../models/User");
var Tweet_1 = require("../models/Tweet");
var templates_1 = require("../lib/templates");
var uptime = function () {
    var duration = date_fns_1.intervalToDuration({
        start: Date.now() - process.uptime(),
        end: Date.now()
    });
    return date_fns_1.formatDuration(duration, {
        format: ['days', 'hours', 'minutes'],
        zero: true
    });
};
var ramusage = function () {
    var ram = process.memoryUsage();
    return (ram.heapTotal / 1e6).toFixed(2);
};
var tgusage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = {};
                return [4 /*yield*/, User_1.UserModel.estimatedDocumentCount()];
            case 1:
                _a.user = _b.sent();
                return [4 /*yield*/, Tweet_1.TweetModel.estimatedDocumentCount()];
            case 2: return [2 /*return*/, (_a.tweet = _b.sent(),
                    _a)];
        }
    });
}); };
var statusmessage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var text, _a, user, tweet;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                text = '';
                text += "<b>Ram usage:</b> " + ramusage() + " MB\n";
                text += "<b>Uptime:</b> " + uptime() + "\n";
                text += "<b>Server time:</b> " + date_fns_timezone_1.formatToTimeZone(new Date(), 'YYYY MM DD hh:mm:ss.SSS', { timeZone: 'Europe/Berlin' }) + "\n";
                return [4 /*yield*/, tgusage()];
            case 1:
                _a = _b.sent(), user = _a.user, tweet = _a.tweet;
                text += "<b>In use by</b> " + user + " user(s)\n";
                text += "<b>Saved</b> " + tweet + " tweet(s)";
                return [2 /*return*/, text];
        }
    });
}); };
var composer = new telegraf_1.Composer();
composer
    .command('status', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, e_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _b = (_a = ctx).reply;
                return [4 /*yield*/, statusmessage()];
            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Update',
                                        callback_data: 'status'
                                    }
                                ]
                            ]
                        }
                    }])];
            case 2:
                _c.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _c.sent();
                return [2 /*return*/, ctx.reply(templates_1.templates.error(e_1))];
            case 4: return [2 /*return*/];
        }
    });
}); })
    .action('status', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _b = (_a = ctx).editMessageText;
                return [4 /*yield*/, statusmessage()];
            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Update',
                                        callback_data: 'status'
                                    }
                                ]
                            ]
                        }
                    }])];
            case 2:
                _c.sent();
                return [4 /*yield*/, ctx.answerCbQuery('')];
            case 3:
                _c.sent();
                return [3 /*break*/, 5];
            case 4:
                e_2 = _c.sent();
                return [2 /*return*/, ctx.answerCbQuery(templates_1.templates.error(e_2), true)];
            case 5: return [2 /*return*/];
        }
    });
}); });
bot_1.bot.use(composer.middleware());
//# sourceMappingURL=status.js.map