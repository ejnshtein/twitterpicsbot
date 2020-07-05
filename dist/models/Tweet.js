"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetModel = exports.Tweet = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var database_1 = require("../database");
var Tweet = /** @class */ (function () {
    function Tweet() {
    }
    __decorate([
        typegoose_1.prop({ required: false }),
        __metadata("design:type", String)
    ], Tweet.prototype, "id", void 0);
    __decorate([
        typegoose_1.prop({ unique: true, required: true }),
        __metadata("design:type", String)
    ], Tweet.prototype, "tweet_id", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", Object)
    ], Tweet.prototype, "tweet", void 0);
    __decorate([
        typegoose_1.prop({ required: true, default: [] }),
        __metadata("design:type", Array)
    ], Tweet.prototype, "users", void 0);
    Tweet = __decorate([
        typegoose_1.modelOptions({
            existingConnection: database_1.connection,
            options: {
                customName: 'tweet'
            },
            schemaOptions: {
                id: false,
                timestamps: {
                    updatedAt: 'updated_at',
                    createdAt: 'created_at'
                }
            }
        })
    ], Tweet);
    return Tweet;
}());
exports.Tweet = Tweet;
exports.TweetModel = typegoose_1.getModelForClass(Tweet);
//# sourceMappingURL=Tweet.js.map