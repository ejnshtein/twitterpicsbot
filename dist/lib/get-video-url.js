"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getVideoUrl(video_info) {
    var _a = video_info.variants
        .filter(function (_a) {
        var content_type = _a.content_type;
        return content_type === 'video/mp4';
    })
        .pop(), url = _a.url, content_type = _a.content_type;
    return {
        video_url: url,
        mime_type: content_type
    };
}
exports.default = getVideoUrl;
//# sourceMappingURL=get-video-url.js.map