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
exports.OrderService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const orders_1 = require("../types/orders");
class OrderService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new OrderService();
        }
        return this.instance;
    }
    constructor() {
        this.orderModel = models_1.Order;
    }
    createOrder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { customerId, status, expiresAt, totalPrice, subscriptions, discount, couponId, } = params;
            const orderNo = Math.floor(100000 + Math.random() * 900000);
            const order = this.orderModel.build(Object.assign({ customerId,
                status,
                expiresAt,
                totalPrice,
                orderNo,
                subscriptions,
                discount }, (couponId && { couponId })));
            return yield order.save();
        });
    }
    getOrder(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield this.orderModel
                .find({
                customerId,
                status: orders_1.OrderStatus.PENDING,
            })
                .populate({
                path: "subscriptions.packageGroupId",
                select: "title isSeatable type discount",
            })
                .sort({ createdAt: -1 })
                .lean();
            return orders[0];
        });
    }
    getOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel
                .findOne({ _id: new mongoose_1.Types.ObjectId(orderId) })
                .populate({
                path: "subscriptions.packageGroupId",
                select: "title explanation currency icon isSeatable numberOfSeats discount",
            })
                .lean();
        });
    }
    getOrders(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel
                .find({
                customerId,
                status: orders_1.OrderStatus.PENDING,
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59)),
                },
            })
                .sort({ createdAt: -1 })
                .populate({
                path: "subscriptions.packageGroupId",
                select: "title",
            })
                .lean();
        });
    }
    getOrdersByCustomerId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel
                .findOne({
                customerId,
                status: orders_1.OrderStatus.PENDING,
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59)),
                },
            })
                .sort({ createdAt: -1 })
                .populate({
                path: "subscriptions.packageGroupId",
                select: "title",
            })
                .lean();
        });
    }
    updateOrderStatus(orderId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel.updateOne({ _id: orderId }, { $set: { status } });
        });
    }
    getCompletedOrder(customerId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel
                .findOne({
                customerId,
                _id: orderId,
                status: orders_1.OrderStatus.PAID,
            })
                .populate({
                path: "subscriptions.packageGroupId",
                select: "title icon",
            })
                .lean();
        });
    }
    getCompletedOrders(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel.find({
                customerId,
                status: orders_1.OrderStatus.PAID,
            });
        });
    }
    deleteOldOrder(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.orderModel.deleteMany({
                customerId,
                status: orders_1.OrderStatus.PENDING,
                createdAt: {
                    $lt: new Date(new Date().setHours(0, 0, 0)),
                },
            });
        });
    }
}
exports.OrderService = OrderService;
