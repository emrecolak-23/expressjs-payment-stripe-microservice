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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponUsageService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
class CouponUsageService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new CouponUsageService();
        }
        return this.instance;
    }
    constructor() {
        this.couponUsageModel = models_1.CouponUsage;
    }
    chekcCouponUsageForOneTime(couponId) {
        return __awaiter(this, void 0, void 0, function* () {
            const usedCoupon = yield this.couponUsageModel.findOne({
                couponId,
                isUsed: true,
            });
            return usedCoupon;
        });
    }
    updateCouponUsed(couponId, cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.couponUsageModel.findOneAndUpdate({ couponId, cartId }, { isUsed: true });
        });
    }
    checkCouponUsage(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { couponId, userId, cartItems } = params;
            const usedCoupon = yield this.couponUsageModel.findOne({
                couponId,
                userId,
                packageId: {
                    $in: cartItems.map((item) => new mongoose_1.Types.ObjectId(item.packageGroupId)),
                },
            });
            return usedCoupon;
        });
    }
    deleteCouponUsage(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.couponUsageModel.deleteOne({
                cartId: new mongoose_1.Types.ObjectId(cartId),
            });
        });
    }
    checkCouponExistInCart(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cartId, userId } = params;
            const usedCoupon = yield this.couponUsageModel.findOne({
                cartId: new mongoose_1.Types.ObjectId(cartId),
                userId,
                isUsed: false,
            });
            return usedCoupon;
        });
    }
    useCoupon(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { couponId, userId, cartId } = params;
            const newCouponUsage = this.couponUsageModel.build({
                couponId: couponId,
                userId: userId,
                cartId: cartId,
            });
            yield newCouponUsage.save();
            return newCouponUsage;
        });
    }
    cancelCouponUsage(userId, cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.couponUsageModel.deleteOne({ userId, cartId });
        });
    }
    getCurrentCartCoupon(cartId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCouponUsage = yield this.couponUsageModel
                .findOne({
                userId,
                cartId: new mongoose_1.Types.ObjectId(cartId),
                isUsed: false,
            })
                .populate("couponId")
                .lean();
            return existingCouponUsage;
        });
    }
    couponCodeUsage(couponCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $lookup: {
                        from: "coupons",
                        localField: "couponId",
                        foreignField: "_id",
                        as: "couponInfo",
                    },
                },
                {
                    $unwind: {
                        path: "$couponInfo",
                    },
                },
                {
                    $group: {
                        _id: "$couponInfo._id",
                        couponCode: { $first: "$couponInfo.code" },
                        authorizedName: { $first: "$couponInfo.authorizationName" },
                        usedCount: {
                            $sum: { $cond: { if: "$isUsed", then: 1, else: 0 } },
                        },
                    },
                },
                {
                    $match: {
                        couponCode,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        couponCode: 1,
                        authorizedName: 1,
                        usedCount: 1,
                    },
                },
            ];
            const couponUsage = yield this.couponUsageModel.aggregate(pipeline);
            return couponUsage;
        });
    }
    couponCodePriceInsights(couponCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        isUsed: true,
                    },
                },
                {
                    $lookup: {
                        from: "coupons",
                        localField: "couponId",
                        foreignField: "_id",
                        as: "couponInfo",
                    },
                },
                {
                    $unwind: {
                        path: "$couponInfo",
                    },
                },
                {
                    $lookup: {
                        from: "packages",
                        localField: "packageId",
                        foreignField: "_id",
                        as: "packageInfo",
                    },
                },
                {
                    $unwind: {
                        path: "$packageInfo",
                    },
                },
                {
                    $addFields: {
                        packageInfo: {
                            $cond: {
                                if: { $eq: [{ $size: "$packageInfo" }, 0] },
                                then: null,
                                else: "$packageInfo",
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: "$couponInfo._id",
                        couponCode: { $first: "$couponInfo.code" },
                        discount: { $first: "$couponInfo.discount" },
                        authorizedName: { $first: "$couponInfo.authorizationName" },
                        usedCount: {
                            $sum: { $cond: { if: "$isUsed", then: 1, else: 0 } },
                        },
                        packageInfo: { $push: "$packageInfo" },
                    },
                },
                {
                    $match: {
                        couponCode,
                    },
                },
            ];
            const result = yield this.couponUsageModel.aggregate(pipeline);
            const totalPrice = result[0].packageInfo.reduce((curr, product) => {
                return (curr += product.price);
            }, 0);
            result[0].totalPrice = parseFloat(totalPrice.toFixed(2));
            result[0].discountedPrice =
                result[0].totalPrice - (result[0].totalPrice * result[0].discount) / 100;
            return result;
        });
    }
}
exports.CouponUsageService = CouponUsageService;
