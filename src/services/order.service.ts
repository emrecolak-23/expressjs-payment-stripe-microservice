import { Types } from "mongoose";
import { Order, OrderModel } from "../models";
import { CreateOrderDto } from "../dtos";
import { OrderStatus } from "../types/orders";

class OrderService {
  private static instance: OrderService;
  static getInstance() {
    if (!this.instance) {
      this.instance = new OrderService();
    }
    return this.instance;
  }

  orderModel: OrderModel;
  private constructor() {
    this.orderModel = Order;
  }

  async createOrder(params: CreateOrderDto) {
    const {
      customerId,
      status,
      expiresAt,
      totalPrice,
      subscriptions,
      discount,
      couponId,
    } = params;
    const orderNo = Math.floor(100000 + Math.random() * 900000);
    const order = this.orderModel.build({
      customerId,
      status,
      expiresAt,
      totalPrice,
      orderNo,
      subscriptions,
      discount,
      ...(couponId && { couponId }),
    });

    return await order.save();
  }

  async getOrder(customerId: number) {
    const orders = await this.orderModel
      .find({
        customerId,
        status: OrderStatus.PENDING,
      })
      .populate({
        path: "subscriptions.packageGroupId",
        select: "title isSeatable type discount",
      })
      .sort({ createdAt: -1 })
      .lean();

    return orders[0];
  }

  async getOrderById(orderId: string) {
    return await this.orderModel
      .findOne({ _id: new Types.ObjectId(orderId) })
      .populate({
        path: "subscriptions.packageGroupId",
        select:
          "title explanation currency icon isSeatable numberOfSeats discount",
      })
      .lean();
  }

  async getOrders(customerId: number) {
    return await this.orderModel
      .find({
        customerId,
        status: OrderStatus.PENDING,
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
  }

  async getOrdersByCustomerId(customerId: number) {
    return await this.orderModel
      .findOne({
        customerId,
        status: OrderStatus.PENDING,
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
  }

  async updateOrderStatus(orderId: string, status: string) {
    return await this.orderModel.updateOne(
      { _id: orderId },
      { $set: { status } }
    );
  }

  async getCompletedOrder(customerId: number, orderId: string) {
    return await this.orderModel
      .findOne({
        customerId,
        _id: orderId,
        status: OrderStatus.PAID,
      })
      .populate({
        path: "subscriptions.packageGroupId",
        select: "title icon",
      })
      .lean();
  }

  async getCompletedOrders(customerId: number) {
    return await this.orderModel.find({
      customerId,
      status: OrderStatus.PAID,
    });
  }

  async deleteOldOrder(customerId: number) {
    return await this.orderModel.deleteMany({
      customerId,
      status: OrderStatus.PENDING,
      createdAt: {
        $lt: new Date(new Date().setHours(0, 0, 0)),
      },
    });
  }
}

export { OrderService };
