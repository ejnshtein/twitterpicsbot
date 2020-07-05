"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = void 0;
exports.sendError = function (error) { return ({
    type: 'article',
    id: '1',
    title: 'Error!',
    description: "Something went wrong... " + error.message,
    input_message_content: {
        message_text: "Something went wrong... " + error.message
    }
}); };
//# sourceMappingURL=send-error.js.map