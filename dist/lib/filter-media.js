"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function filterMedia(tweets) {
    var photosAndVideos = [];
    var other = [];
    for (var i = 0; i < tweets.length; i++) {
        var tweet = tweets[i];
        if (tweet.extended_entities.media.every(function (_a) {
            var type = _a.type;
            return ['photo', 'video'].includes(type);
        })) {
            photosAndVideos.push(tweet);
        }
        else {
            other.push(tweet);
        }
    }
    return [photosAndVideos, other];
}
exports.default = filterMedia;
//# sourceMappingURL=filter-media.js.map