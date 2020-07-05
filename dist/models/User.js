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
exports.UserModel = exports.User = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var database_1 = require("../database");
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        typegoose_1.prop({ unique: true }),
        __metadata("design:type", Number)
    ], User.prototype, "id", void 0);
    __decorate([
        typegoose_1.prop({ required: false }),
        __metadata("design:type", String)
    ], User.prototype, "username", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", String)
    ], User.prototype, "first_name", void 0);
    __decorate([
        typegoose_1.prop({ required: false }),
        __metadata("design:type", String)
    ], User.prototype, "last_name", void 0);
    __decorate([
        typegoose_1.prop({ required: true, default: false }),
        __metadata("design:type", Boolean)
    ], User.prototype, "private_mode", void 0);
    __decorate([
        typegoose_1.prop({ required: true, default: true }),
        __metadata("design:type", Boolean)
    ], User.prototype, "inline_buttons", void 0);
    User = __decorate([
        typegoose_1.modelOptions({
            existingConnection: database_1.connection,
            schemaOptions: {
                timestamps: {
                    updatedAt: 'updated_at',
                    createdAt: 'created_at'
                },
                toJSON: {
                    virtuals: true
                }
            }
        })
    ], User);
    return User;
}());
exports.User = User;
exports.UserModel = typegoose_1.getModelForClass(User);
//# sourceMappingURL=User.js.map