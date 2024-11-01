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
exports.CouponService = void 0;
const coupon_model_1 = require("../models/coupon.model");
const mongoose_1 = require("mongoose");
class CouponService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new CouponService();
        }
        return this.instance;
    }
    constructor() {
        this.couponModel = coupon_model_1.Coupon;
    }
    createCoupon(params, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationName, discount, expirationDate, isSubs, trialDuration, isOnlyForOneCompany, } = params;
            // const couponCode = this.createCouponCode(authorizationName, discount);
            const coupon = this.couponModel.build(Object.assign(Object.assign({ code: authorizationName, authorizationName,
                discount,
                expirationDate,
                isSubs, isSingleUse: isSubs && !trialDuration ? false : true }, (trialDuration ? { trialDuration } : {})), { isOnlyForOneCompany }));
            yield coupon.save({ session });
            return coupon;
        });
    }
    createCouponCode(authorizationName, discount) {
        return `${authorizationName}-${discount}`;
    }
    getCouponById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.couponModel.findById(id);
        });
    }
    getActiveCouponByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const coupon = yield this.couponModel.findOne({ code, isActive: true });
            return coupon;
        });
    }
    getCouponByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const coupon = yield this.couponModel.findOne({ code });
            return coupon;
        });
    }
    deactivateCoupon(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.couponModel.updateOne({ _id: new mongoose_1.Types.ObjectId(id) }, { isActive: false });
        });
    }
    getAllCoupon(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize, search, sort } = queryParams;
            const skip = (page - 1) * pageSize;
            const limit = pageSize;
            let query = {};
            if (search) {
                query = {
                    authorizationName: { $regex: search, $options: "i" },
                    code: { $regex: search, $options: "i" },
                };
            }
            const totalCount = yield this.couponModel.countDocuments();
            const row = yield this.couponModel
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);
            return {
                row,
                totalCount,
                page,
                pageSize,
            };
        });
    }
}
exports.CouponService = CouponService;
