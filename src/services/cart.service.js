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
exports.CartService = void 0;
const models_1 = require("../models");
const payments_1 = require("../types/payments");
class CartService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new CartService();
        }
        return this.instance;
    }
    constructor() {
        this.cartModel = models_1.Cart;
    }
    addToCart(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = this.cartModel.build(data);
            yield cart.save();
            return cart;
        });
    }
    checkCartIsExist(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield models_1.Cart.findOne({ customerId });
        });
    }
    getCart(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield models_1.Cart.findOne({ customerId }).populate("items.packageGroupId", "title");
            return cart;
        });
    }
    getCartByCustomerId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield models_1.Cart.findOne({ customerId })
                .populate("items.packageGroupId", "title price isSeatable icon type discount")
                .lean();
            if (!cart) {
                return cart;
            }
            const cartItems = cart === null || cart === void 0 ? void 0 : cart.items.map((item) => {
                return {
                    _id: item.packageGroupId._id,
                    title: item.packageGroupId.title,
                    icon: item.packageGroupId.icon,
                    type: item.packageGroupId.type,
                    isSeatable: item.packageGroupId.isSeatable,
                    price: Object.assign(Object.assign({ price: item.packageGroupId.price -
                            (item.packageGroupId.price * item.packageGroupId.discount) / 100, totalPrice: item.price - (item.price * item.packageGroupId.discount) / 100, currency: payments_1.PaymentCurrency.EUR, currencyPrefix: "€" }, (item.numberOfSeats ? { numberOfSeats: item.numberOfSeats } : {})), (item.durationType ? { durationType: item.durationType } : {})),
                };
            });
            const totalPrice = cartItems.reduce((acc, item) => {
                return acc + item.price.totalPrice;
            }, 0);
            let cartDiscountedPrice = totalPrice;
            if (cart.discount) {
                cartDiscountedPrice = totalPrice - (totalPrice * cart.discount) / 100;
            }
            const resultCart = {
                _id: cart._id,
                totalPrice,
                items: cartItems,
                cartDiscountedPrice,
                discount: cart.discount,
            };
            return resultCart;
        });
    }
    deleteCartByCustomerId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield models_1.Cart.deleteOne({ customerId });
            return cart;
        });
    }
    getCarByCustomerId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield models_1.Cart.findOne({ customerId });
            return cart;
        });
    }
    deleteCouponFromCart(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.getCartById(cartId);
            if (cart) {
                cart.discount = 0;
                cart.couponId = undefined;
                return yield cart.save();
            }
            else {
                return null;
            }
        });
    }
    getCartById(cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield models_1.Cart.findById(cartId).populate("items.packageGroupId", "type");
            return cart;
        });
    }
    getCartByUserId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield models_1.Cart.findOne({ customerId });
            return cart;
        });
    }
}
exports.CartService = CartService;
