import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import {
  CouponService,
  CouponUsageService,
  CartService,
  OrderService,
} from "../services";
import SuccessResponse from "../responses/success-response";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { NotFoundError } from "../errors/not-found-error";
import { i18n } from "../middlewares";
import Stripe from "stripe";
import moment from "moment";
import { SubscriptionsType } from "../types/subscription";
import { ListCouponDto } from "../dtos";

export class CouponController {
  static instance: CouponController;
  static getInstance(
    couponService: CouponService,
    couponUsageService: CouponUsageService,
    cartService: CartService,
    orderService: OrderService
  ) {
    if (!this.instance) {
      this.instance = new CouponController(
        couponService,
        couponUsageService,
        cartService,
        orderService
      );
    }
    return this.instance;
  }

  private constructor(
    private couponService: CouponService,
    private couponUsageService: CouponUsageService,
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    const { authorizationName, discount, expirationDate, isSubs } = req.body;

    const stripeApi = new Stripe(process.env.STRIPE_RESTRICTED_KEY!);

    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const existingCouponCode = await this.couponService.getActiveCouponByCode(
        `${authorizationName}-${discount}`
      );

      if (existingCouponCode) {
        throw new NotAuthorizedError(i18n.__("coupon_code_already_exists"));
      }

      const result = await this.couponService.createCoupon(
        {
          authorizationName,
          discount,
          expirationDate,
          isSubs,
        },
        session
      );
      const now = moment();
      const durationInMonth = moment(expirationDate).diff(now, "months");

      if (isSubs && durationInMonth < 1) {
        throw new NotAuthorizedError(i18n.__("coupon_duration_invalid"));
      }

      const stripeCoupon = await stripeApi.coupons.create({
        percent_off: discount,
        duration: isSubs ? "repeating" : "once",
        duration_in_months: isSubs
          ? moment(expirationDate).diff(now, "months")
          : undefined,
        id: result._id.toString(),
        name: result.code,
        redeem_by: Math.floor(new Date(expirationDate).getTime() / 1000),
      });
      await session.commitTransaction();
      session.endSession();
      res.send(result);
    } catch (err: any) {
      if (session) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
      }
      return next(err);
    }
  }

  async useCoupon(req: Request, res: Response) {
    const { id: userId } = req.currentUser;
    const { couponCode, cartId } = req.body;

    const existingCart: any = await this.cartService.getCartById(cartId);
    if (!existingCart) {
      throw new NotFoundError(i18n.__("cart_not_found"));
    }

    const coupon = await this.couponService.getCouponByCode(couponCode);

    if (!coupon) {
      throw new NotFoundError(i18n.__("coupon_not_found"));
    }

    const currentDate = new Date();

    if (currentDate > coupon.expirationDate) {
      throw new NotAuthorizedError(i18n.__("coupon_expired"));
    }

    if (!coupon.isActive) {
      throw new NotAuthorizedError(i18n.__("coupon_deactivated"));
    }

    const usedCoupon = await this.couponUsageService.checkCouponUsage({
      couponId: coupon._id,
      userId,
      cartItems: existingCart.items,
    });

    if (usedCoupon?.isUsed) {
      throw new NotAuthorizedError(i18n.__("coupon_already_used"));
    }

    existingCart.items.forEach((item: any) => {
      if (
        item.packageGroupId.type === SubscriptionsType.INMIDI_SUBS &&
        !coupon.isSubs
      ) {
        throw new NotAuthorizedError(i18n.__("coupon_not_applicable"));
      } else if (
        item.packageGroupId.type === SubscriptionsType.GENERAL_CONSULTANCY &&
        coupon.isSubs
      ) {
        throw new NotAuthorizedError(i18n.__("coupon_not_applicable"));
      }
    });

    const couponExistInCart =
      await this.couponUsageService.checkCouponExistInCart({
        cartId,
        userId,
      });

    if (couponExistInCart?.cartId.toString() === cartId) {
      throw new NotAuthorizedError(i18n.__("coupon_already_used_in_this_cart"));
    }

    const couponUsageParams = {
      userId,
      couponId: coupon._id,
      cartItems: existingCart.items,
      cartId,
    };

    await this.couponUsageService.useCoupon(couponUsageParams);

    existingCart.discount = coupon.discount;
    existingCart.couponId = coupon._id;

    await existingCart.save();
    const result = {
      ...existingCart.toJSON(),
    };

    delete result.couponId;

    res.status(200).json(new SuccessResponse(result));
  }

  async cancelCouponUsage(req: Request, res: Response) {
    const { id: userId } = req.currentUser;
    const { cartId } = req.body;

    const existingCart = await this.cartService.getCartById(cartId);
    if (!existingCart) {
      throw new NotFoundError(i18n.__("cart_not_found"));
    }

    if (!existingCart?.couponId) {
      throw new NotAuthorizedError(i18n.__("coupon_not_used"));
    }

    existingCart.discount = 0;
    existingCart.couponId = undefined;

    await existingCart.save();
    await this.couponUsageService.cancelCouponUsage(userId, cartId);

    res.status(200).json(new SuccessResponse(existingCart));
  }

  async getCurrentCartCoupon(req: Request, res: Response) {
    const { id: userId } = req.currentUser;
    const { cartId } = req.body;

    const existingCoupon = await this.couponUsageService.getCurrentCartCoupon(
      cartId,
      userId
    );

    res.status(200).json(
      new SuccessResponse({
        couponId: existingCoupon?.couponId?._id,
        code: existingCoupon?.couponId?.code,
      })
    );
  }

  async couponCodeUsage(req: Request, res: Response) {
    const { couponCode } = req.body;

    const result = await this.couponUsageService.couponCodeUsage(couponCode);
    res.status(200).send(result);
  }

  async getAllCoupon(req: Request, res: Response) {
    const {
      page = 1,
      pageSize = 20,
      search = "",
      sort = { createdAt: -1 },
    } = req.body;

    const queryParams: ListCouponDto = {
      page,
      sort,
      pageSize,
      search,
    };

    const result = await this.couponService.getAllCoupon(queryParams);
    res.status(200).send(result);
  }

  async getCouponById(req: Request, res: Response) {
    const { id: couponId } = req.params;

    const result = await this.couponService.getCouponById(couponId);
    res.status(200).send(result);
  }

  async deactivateCoupon(req: Request, res: Response) {
    const { couponId } = req.body;

    await this.couponService.deactivateCoupon(couponId);
    res.status(200).send({ message: "Coupon deactivated" });
  }

  async couponCodePriceInsights(req: Request, res: Response) {
    const { couponCode } = req.body;

    const result = await this.couponUsageService.couponCodePriceInsights(
      couponCode
    );
    res.status(200).send(result);
  }
}
