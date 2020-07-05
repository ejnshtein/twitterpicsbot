"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
exports.templates = {
    error: function (e) {
        return "Something went wrong...\n\n" + e.message;
    },
    tweetInfo: function (dbtweet) {
        var tweet = dbtweet.tweet, created_at = dbtweet.created_at, added = dbtweet.added;
        var user = tweet.user;
        var message = "<a href=\"https://twitter.com/" + user.screen_name + "\">&#160;</a>";
        message += "<b>Tweet ID:</b> <a href=\"https://twitter.com/" + user.screen_name + "/" + tweet.id_str + "\">" + tweet.id_str + "</a>\n";
        message += "<b>Added to db:</b> " + new Date(created_at).toUTCString() + "\n";
        message += "<b>Tweet created at:</b> " + new Date(tweet.created_at).toUTCString() + "\n";
        message += "<b>User:</b> <a href=\"https://twitter.com/" + user.screen_name + "\">" + user.name + "</a>\n";
        message += "<b>Added by user:</b> " + (added ? 'Yes' : 'No');
        return message;
    }
};
//# sourceMappingURL=templates.js.map