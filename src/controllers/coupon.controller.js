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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const success_response_1 = __importDefault(require("../responses/success-response"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const not_found_error_1 = require("../errors/not-found-error");
const middlewares_1 = require("../middlewares");
const stripe_1 = __importDefault(require("stripe"));
const moment_1 = __importDefault(require("moment"));
const subscription_1 = require("../types/subscription");
class CouponController {
    static getInstance(couponService, couponUsageService, cartService) {
        if (!this.instance) {
            this.instance = new CouponController(couponService, couponUsageService, cartService);
        }
        return this.instance;
    }
    constructor(couponService, couponUsageService, cartService) {
        this.couponService = couponService;
        this.couponUsageService = couponUsageService;
        this.cartService = cartService;
    }
    createCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationName, discount, expirationDate, isSubs, trialDuration, isOnlyForOneCompany, } = req.body;
            if (trialDuration && !isSubs) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("trial_duration_only_for_subs"));
            }
            if (trialDuration && discount < 100) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("trial_duration_only_for_100_discount"));
            }
            const stripeApi = new stripe_1.default(process.env.STRIPE_RESTRICTED_KEY);
            const existingCouponCode = yield this.couponService.getActiveCouponByCode(authorizationName);
            if (existingCouponCode) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_code_already_exists"));
            }
            const now = (0, moment_1.default)();
            const durationInMonth = (0, moment_1.default)(expirationDate).diff(now, "months");
            if (isSubs && durationInMonth < 1) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_duration_invalid"));
            }
            const result = yield this.couponService.createCoupon({
                authorizationName,
                discount,
                expirationDate,
                isSubs,
                trialDuration,
                isOnlyForOneCompany,
            });
            yield stripeApi.coupons.create({
                percent_off: discount,
                duration: isSubs ? "repeating" : "once",
                duration_in_months: isSubs
                    ? (0, moment_1.default)(expirationDate).diff(now, "months")
                    : undefined,
                id: result._id.toString(),
                name: result.code,
                redeem_by: Math.floor(new Date(expirationDate).getTime() / 1000),
            });
            res.send(result);
        });
    }
    useCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: userId } = req.currentUser;
            const { couponCode, cartId } = req.body;
            const existingCart = yield this.cartService.getCartById(cartId);
            if (!existingCart) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
            }
            const coupon = yield this.couponService.getCouponByCode(couponCode);
            if (!coupon) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("coupon_not_found"));
            }
            const currentDate = new Date();
            if (currentDate > coupon.expirationDate) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_expired"));
            }
            if (!coupon.isActive) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_deactivated"));
            }
            if (coupon.isOnlyForOneCompany) {
                yield Promise.all(existingCart.items.map((item) => {
                    if (item.packageGroupId.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY) {
                        throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_only_used_for_subs"));
                    }
                }));
            }
            const usedCoupon = yield this.couponUsageService.checkCouponUsage({
                couponId: coupon._id,
                userId,
                cartItems: existingCart.items,
            });
            if (coupon === null || coupon === void 0 ? void 0 : coupon.isOnlyForOneCompany) {
                const usedCouponByCompany = yield this.couponUsageService.chekcCouponUsageForOneTime(coupon._id);
                if (usedCouponByCompany) {
                    throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_only_for_one_company"));
                }
            }
            if ((usedCoupon === null || usedCoupon === void 0 ? void 0 : usedCoupon.isUsed) && coupon.isSingleUse) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_already_used"));
            }
            existingCart.items.forEach((item) => {
                if (item.packageGroupId.type === subscription_1.SubscriptionsType.INMIDI_SUBS &&
                    !coupon.isSubs &&
                    !coupon.trialDuration) {
                    throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_not_applicable"));
                }
                else if (item.packageGroupId.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY &&
                    coupon.isSubs &&
                    coupon.trialDuration) {
                    throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_not_applicable"));
                }
            });
            const couponExistInCart = yield this.couponUsageService.checkCouponExistInCart({
                cartId,
                userId,
            });
            if ((couponExistInCart === null || couponExistInCart === void 0 ? void 0 : couponExistInCart.cartId.toString()) === cartId) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_already_used_in_this_cart"));
            }
            const couponUsageParams = {
                userId,
                couponId: coupon._id,
                cartItems: existingCart.items,
                cartId,
            };
            yield this.couponUsageService.useCoupon(couponUsageParams);
            existingCart.discount = coupon.discount;
            existingCart.couponId = coupon._id;
            yield existingCart.save();
            const result = Object.assign({}, existingCart.toJSON());
            delete result.couponId;
            res.status(200).json(new success_response_1.default(result));
        });
    }
    cancelCouponUsage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: userId } = req.currentUser;
            const { cartId } = req.body;
            const existingCart = yield this.cartService.getCartById(cartId);
            if (!existingCart) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
            }
            if (!(existingCart === null || existingCart === void 0 ? void 0 : existingCart.couponId)) {
                throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_not_used"));
            }
            existingCart.discount = 0;
            existingCart.couponId = undefined;
            yield existingCart.save();
            yield this.couponUsageService.cancelCouponUsage(userId, cartId);
            res.status(200).json(new success_response_1.default(existingCart));
        });
    }
    getCurrentCartCoupon(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { id: userId } = req.currentUser;
            const { cartId } = req.body;
            const existingCoupon = yield this.couponUsageService.getCurrentCartCoupon(cartId, userId);
            res.status(200).json(new success_response_1.default({
                couponId: (_a = existingCoupon === null || existingCoupon === void 0 ? void 0 : existingCoupon.couponId) === null || _a === void 0 ? void 0 : _a._id,
                code: (_b = existingCoupon === null || existingCoupon === void 0 ? void 0 : existingCoupon.couponId) === null || _b === void 0 ? void 0 : _b.code,
            }));
        });
    }
    couponCodeUsage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { couponCode } = req.body;
            const result = yield this.couponUsageService.couponCodeUsage(couponCode);
            res.status(200).send(result);
        });
    }
    getAllCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, pageSize = 20, search = "", sort = { createdAt: -1 }, } = req.body;
            const queryParams = {
                page,
                sort,
                pageSize,
                search,
            };
            const result = yield this.couponService.getAllCoupon(queryParams);
            res.status(200).send(result);
        });
    }
    getCouponById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: couponId } = req.params;
            const result = yield this.couponService.getCouponById(couponId);
            res.status(200).send(result);
        });
    }
    deactivateCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { couponId } = req.body;
            yield this.couponService.deactivateCoupon(couponId);
            res.status(200).send({ message: "Coupon deactivated" });
        });
    }
    couponCodePriceInsights(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { couponCode } = req.body;
            const result = yield this.couponUsageService.couponCodePriceInsights(couponCode);
            res.status(200).send(result);
        });
    }
}
exports.CouponController = CouponController;
