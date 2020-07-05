"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThumbUrl = void 0;
function getThumbUrl(url, name, format) {
    if (name === void 0) { name = 'thumb'; }
    if (format === void 0) { format = 'jpg'; }
    var thumb = new URL(url.replace(/\.(jpg|png)$/i, ''));
    thumb.searchParams.set('format', format);
    thumb.searchParams.set('name', name);
    return thumb.toString();
}
exports.getThumbUrl = getThumbUrl;
//# sourceMappingURL=get-thumb-url.js.map