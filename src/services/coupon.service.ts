import { Coupon, CouponModel } from "../models/coupon.model";
import { CreateCouponDto, ListCouponDto } from "../dtos";
import mongoose, { Types } from "mongoose";

export class CouponService {
  static instance: CouponService;
  static getInstance() {
    if (!this.instance) {
      this.instance = new CouponService();
    }
    return this.instance;
  }

  couponModel: CouponModel;
  private constructor() {
    this.couponModel = Coupon;
  }

  async createCoupon(
    params: CreateCouponDto,
    session?: mongoose.ClientSession
  ) {
    const {
      authorizationName,
      discount,
      expirationDate,
      isSubs,
      trialDuration,
      isOnlyForOneCompany,
    } = params;

    // const couponCode = this.createCouponCode(authorizationName, discount);

    const coupon = this.couponModel.build({
      code: authorizationName,
      authorizationName,
      discount,
      expirationDate,
      isSubs,
      isSingleUse: isSubs && !trialDuration ? false : true,
      ...(trialDuration ? { trialDuration } : {}),
      isOnlyForOneCompany,
    });

    await coupon.save({ session });

    return coupon;
  }

  createCouponCode(authorizationName: string, discount: number) {
    return `${authorizationName}-${discount}`;
  }

  async getCouponById(id: string) {
    return await this.couponModel.findById(id);
  }

  async getActiveCouponByCode(code: string) {
    const coupon = await this.couponModel.findOne({ code, isActive: true });
    return coupon;
  }

  async getCouponByCode(code: string) {
    const coupon = await this.couponModel.findOne({ code });
    return coupon;
  }

  async deactivateCoupon(id: string) {
    return await this.couponModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { isActive: false }
    );
  }

  async getAllCoupon(queryParams: ListCouponDto) {
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

    const totalCount = await this.couponModel.countDocuments();
    const row = await this.couponModel
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
  }
}
