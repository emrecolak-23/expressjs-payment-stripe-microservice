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
exports.CartController = void 0;
const not_found_error_1 = require("../errors/not-found-error");
const middlewares_1 = require("../middlewares");
const subscription_1 = require("../types/subscription");
const success_response_1 = __importDefault(require("../responses/success-response"));
class CartController {
    static getInstance(cartService, subscriptionPackageService, couponUsageService) {
        if (!this.instance) {
            this.instance = new CartController(cartService, subscriptionPackageService, couponUsageService);
        }
        return this.instance;
    }
    constructor(cartService, subscriptionPackageService, couponUsageService) {
        this.cartService = cartService;
        this.subscriptionPackageService = subscriptionPackageService;
        this.couponUsageService = couponUsageService;
    }
    addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { packageGroupId, numberOfSeats, durationType } = req.body;
            const customerId = req.currentUser.id;
            const existingPackageGroup = yield this.subscriptionPackageService.getSubscriptionPackage(packageGroupId);
            if (!existingPackageGroup) {
                return res
                    .status(404)
                    .json({ message: middlewares_1.i18n.__("package_group_not_found") });
            }
            if (existingPackageGroup.type === subscription_1.SubscriptionsType.INMIDI_SUBS &&
                !durationType) {
                return res
                    .status(400)
                    .json({ message: middlewares_1.i18n.__("duration_type_required") });
            }
            else if (existingPackageGroup.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY &&
                !numberOfSeats) {
                return res
                    .status(400)
                    .json({ message: middlewares_1.i18n.__("number_of_seats_required") });
            }
            const isCartExist = yield this.cartService.checkCartIsExist(customerId);
            const totalPrice = yield this.subscriptionPackageService.calculatePrice({
                packageGroupId,
                numberOfSeats,
                durationType,
            });
            console.log("-----------", isCartExist, "-----------");
            if (!isCartExist) {
                const cart = yield this.cartService.addToCart({
                    customerId,
                    items: [
                        Object.assign(Object.assign({ packageGroupId, price: totalPrice, unitPrice: existingPackageGroup.price }, (numberOfSeats ? { numberOfSeats } : {})), (durationType ? { durationType } : {})),
                    ],
                });
                return res.status(201).json(cart);
            }
            let existingCart = yield this.cartService.getCart(customerId);
            console.log(totalPrice, "totalPrice");
            console.log(existingCart, "existingCart");
            existingCart === null || existingCart === void 0 ? void 0 : existingCart.items.forEach((item) => {
                if (typeof item.packageGroupId === "string") {
                    if (item.packageGroupId !== packageGroupId) {
                        return res
                            .status(400)
                            .json({ message: middlewares_1.i18n.__("other_package_already_added") });
                    }
                }
                else if (item.packageGroupId._id &&
                    item.packageGroupId._id.toString() !== packageGroupId) {
                    return res
                        .status(400)
                        .json({ message: middlewares_1.i18n.__("other_package_already_added") });
                }
            });
            const existingPackage = yield this.subscriptionPackageService.getSubscriptionPackage(packageGroupId);
            const existingItem = existingCart.items.find((item) => {
                if (typeof item.packageGroupId === "string") {
                    return item.packageGroupId === packageGroupId;
                }
                else if (item.packageGroupId._id) {
                    return item.packageGroupId._id.toString() === packageGroupId;
                }
                return false;
            });
            if (!existingPackage) {
                return res.status(404).json({ message: middlewares_1.i18n.__("package_not_found") });
            }
            if (existingPackage.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY) {
                if (existingItem) {
                    const index = existingCart.items.indexOf(existingItem);
                    if (numberOfSeats > 0) {
                        existingCart.items[index].numberOfSeats += numberOfSeats;
                        existingCart.items[index].price += totalPrice;
                    }
                    else {
                        existingCart.items.splice(index, 1);
                    }
                }
                else {
                    existingCart.items.push({
                        packageGroupId,
                        unitPrice: existingPackageGroup.price,
                        numberOfSeats,
                        price: totalPrice,
                    });
                }
            }
            else if (existingPackage.type === subscription_1.SubscriptionsType.INMIDI_SUBS &&
                existingItem) {
                return res
                    .status(400)
                    .json({ message: middlewares_1.i18n.__("package_already_added") });
            }
            else if (existingPackage.type === subscription_1.SubscriptionsType.INMIDI_SUBS &&
                !existingItem) {
                existingCart.items.push({
                    packageGroupId,
                    unitPrice: existingPackageGroup.price,
                    durationType,
                    price: totalPrice,
                });
            }
            yield existingCart.save();
            res.status(200).json(existingCart);
        });
    }
    getCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.currentUser.id;
            const isCartExist = yield this.cartService.checkCartIsExist(customerId);
            if (!isCartExist) {
                return res.status(200).json({});
            }
            let cart = yield this.cartService.getCartByCustomerId(customerId);
            if (!cart) {
                res.status(200).json({});
            }
            const traslatedCartItems = yield Promise.all(cart.items.map((item) => __awaiter(this, void 0, void 0, function* () {
                return yield this.subscriptionPackageService.getTranslatedPackage(item, req.headers["accept-language"]);
            })));
            cart.items = [...traslatedCartItems];
            res.status(200).json(cart);
        });
    }
    deleteCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: customerId } = req.currentUser;
            const cart = yield this.cartService.getCart(customerId);
            if (!cart) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
            }
            yield cart.deleteOne();
            yield this.couponUsageService.cancelCouponUsage(customerId, cart._id);
            res.status(200).json({ message: middlewares_1.i18n.__("cart_deleted") });
        });
    }
    deleteCartItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.currentUser.id;
            const { packageGroupId } = req.params;
            const cart = yield this.cartService.getCart(customerId);
            if (!cart) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
            }
            const existingItem = cart.items.find((item) => {
                if (typeof item.packageGroupId === "string") {
                    return item.packageGroupId === packageGroupId;
                }
                else {
                    return item.packageGroupId._id.toString() === packageGroupId;
                }
            });
            if (!existingItem) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("item_not_found"));
            }
            const index = cart.items.indexOf(existingItem);
            cart.items.splice(index, 1);
            yield cart.save();
            if (cart.items.length === 0) {
                yield this.cartService.deleteCouponFromCart(cart._id);
                yield this.couponUsageService.deleteCouponUsage(cart._id);
            }
            res.status(200).json({ message: middlewares_1.i18n.__("item_deleted") });
        });
    }
    updateCartItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.currentUser.id;
            const { packageGroupId } = req.params;
            const { numberOfSeats } = req.body;
            const cart = yield this.cartService.getCart(customerId);
            if (!cart) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
            }
            const existingItem = cart.items.find((item) => {
                if (typeof item.packageGroupId === "string") {
                    return item.packageGroupId === packageGroupId;
                }
                else if (item.packageGroupId._id) {
                    return item.packageGroupId._id.toString() === packageGroupId;
                }
                return false;
            });
            if (!existingItem) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("item_not_found"));
            }
            const index = cart.items.indexOf(existingItem);
            const totalPrice = yield this.subscriptionPackageService.calculatePrice({
                packageGroupId,
                numberOfSeats,
            });
            cart.items[index].numberOfSeats = numberOfSeats;
            cart.items[index].price = totalPrice;
            yield cart.save();
            res.status(200).json({ message: middlewares_1.i18n.__("item_updated") });
        });
    }
    getCartItemsNumber(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.currentUser.id;
            const cart = yield this.cartService.getCartByUserId(userId);
            if (!cart) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
            }
            res.status(200).json(new success_response_1.default(cart.items.length));
        });
    }
}
exports.CartController = CartController;
