import { Request, Response } from "express";
import {
  CartService,
  SubscriptionPackageService,
  CouponUsageService,
} from "../services";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";
import { i18n } from "../middlewares";
import { SubscriptionsType } from "../types/subscription";
import SuccessResponse from "../responses/success-response";
import { ICartItem } from "../types/carts";

class CartController {
  private static instance: CartController;

  static getInstance(
    cartService: CartService,
    subscriptionPackageService: SubscriptionPackageService,
    couponUsageService: CouponUsageService
  ) {
    if (!this.instance) {
      this.instance = new CartController(
        cartService,
        subscriptionPackageService,
        couponUsageService
      );
    }
    return this.instance;
  }

  private constructor(
    private cartService: CartService,
    private subscriptionPackageService: SubscriptionPackageService,
    private couponUsageService: CouponUsageService
  ) {}

  async addToCart(req: Request, res: Response) {
    const { packageGroupId, numberOfSeats, durationType } = req.body;
    const customerId = req.currentUser.id;

    const existingPackageGroup =
      await this.subscriptionPackageService.getSubscriptionPackage(
        packageGroupId
      );

    if (!existingPackageGroup) {
      throw new NotFoundError(i18n.__("package_group_not_found"));
    }

    if (
      existingPackageGroup.type === SubscriptionsType.INMIDI_SUBS &&
      !durationType
    ) {
      throw new BadRequestError(i18n.__("duration_type_required"));
    } else if (
      existingPackageGroup.type === SubscriptionsType.GENERAL_CONSULTANCY &&
      !numberOfSeats
    ) {
      throw new BadRequestError(i18n.__("number_of_seats_required"));
    }

    const existingCart = await this.cartService.getCart(customerId);

    existingCart?.items.forEach((item: ICartItem) => {
      if (typeof item.packageGroupId === "string") {
        if (item.packageGroupId !== packageGroupId) {
          throw new BadRequestError(i18n.__("other_package_already_added"));
        }
      } else if (
        item.packageGroupId._id &&
        item.packageGroupId._id.toString() !== packageGroupId
      ) {
        throw new BadRequestError(i18n.__("other_package_already_added"));
      }
    });

    const totalPrice = await this.subscriptionPackageService.calculatePrice({
      packageGroupId,
      numberOfSeats,
      durationType,
    });
    if (!existingCart) {
      const cart = await this.cartService.addToCart({
        customerId,
        items: [
          {
            packageGroupId,
            price: totalPrice!,
            unitPrice: existingPackageGroup.price,
            ...(numberOfSeats ? { numberOfSeats } : {}),
            ...(durationType ? { durationType } : {}),
          },
        ],
      });
      return res.status(201).json(cart);
    }

    const existingPackage =
      await this.subscriptionPackageService.getSubscriptionPackage(
        packageGroupId
      );

    const existingItem = existingCart.items.find((item: ICartItem) => {
      if (typeof item.packageGroupId === "string") {
        return item.packageGroupId === packageGroupId;
      } else if (item.packageGroupId._id) {
        return item.packageGroupId._id.toString() === packageGroupId;
      }
      return false;
    });

    if (!existingPackage) {
      throw new NotFoundError(i18n.__("package_not_found"));
    }

    if (existingPackage.type === SubscriptionsType.GENERAL_CONSULTANCY) {
      if (existingItem) {
        const index = existingCart.items.indexOf(existingItem);
        if (numberOfSeats > 0) {
          existingCart.items[index].numberOfSeats += numberOfSeats;
          existingCart.items[index].price += totalPrice!;
        } else {
          existingCart.items.splice(index, 1);
        }
      } else {
        existingCart.items.push({
          packageGroupId,
          unitPrice: existingPackageGroup.price,
          numberOfSeats,
          price: totalPrice!,
        });
      }
    } else if (
      existingPackage.type === SubscriptionsType.INMIDI_SUBS &&
      existingItem
    ) {
      throw new BadRequestError(i18n.__("package_already_added"));
    } else if (
      existingPackage.type === SubscriptionsType.INMIDI_SUBS &&
      !existingItem
    ) {
      existingCart.items.push({
        packageGroupId,
        unitPrice: existingPackageGroup.price,
        durationType,
        price: totalPrice!,
      });
    }

    await existingCart.save();
    res.status(200).json(existingCart);
  }

  async getCart(req: Request, res: Response) {
    const customerId = req.currentUser.id;
    let cart = await this.cartService.getCartByCustomerId(customerId);

    if (!cart) {
      res.status(200).json({});
    }

    const traslatedCartItems = await Promise.all(
      cart!.items.map(async (item: any) => {
        return await this.subscriptionPackageService.getTranslatedPackage(
          item,
          req.headers["accept-language"] as string
        );
      })
    );
    cart!.items = [...traslatedCartItems];
    res.status(200).json(cart);
  }

  async deleteCart(req: Request, res: Response) {
    const { id: customerId } = req.currentUser;
    const cart = await this.cartService.getCart(customerId);
    if (!cart) {
      throw new NotFoundError(i18n.__("cart_not_found"));
    }
    await cart.deleteOne();
    await this.couponUsageService.cancelCouponUsage(customerId, cart._id);
    res.status(200).json({ message: i18n.__("cart_deleted") });
  }

  async deleteCartItem(req: Request, res: Response) {
    const customerId = req.currentUser.id;
    const { packageGroupId } = req.params;
    const cart = await this.cartService.getCart(customerId);
    if (!cart) {
      throw new NotFoundError(i18n.__("cart_not_found"));
    }
    const existingItem = cart.items.find((item: ICartItem) => {
      if (typeof item.packageGroupId === "string") {
        return item.packageGroupId === packageGroupId;
      } else {
        return item.packageGroupId._id.toString() === packageGroupId;
      }
    });
    if (!existingItem) {
      throw new NotFoundError(i18n.__("item_not_found"));
    }
    const index = cart.items.indexOf(existingItem);
    cart.items.splice(index, 1);
    await cart.save();
    res.status(200).json({ message: i18n.__("item_deleted") });
  }

  async updateCartItem(req: Request, res: Response) {
    const customerId = req.currentUser.id;
    const { packageGroupId } = req.params;
    const { numberOfSeats } = req.body;

    const cart = await this.cartService.getCart(customerId);
    if (!cart) {
      throw new NotFoundError(i18n.__("cart_not_found"));
    }
    const existingItem = cart.items.find((item: ICartItem) => {
      if (typeof item.packageGroupId === "string") {
        return item.packageGroupId === packageGroupId;
      } else if (item.packageGroupId._id) {
        return item.packageGroupId._id.toString() === packageGroupId;
      }
      return false;
    });
    if (!existingItem) {
      throw new NotFoundError(i18n.__("item_not_found"));
    }
    const index = cart.items.indexOf(existingItem);
    const totalPrice = await this.subscriptionPackageService.calculatePrice({
      packageGroupId,
      numberOfSeats,
    });
    cart.items[index].numberOfSeats = numberOfSeats;
    cart.items[index].price = totalPrice!;
    await cart.save();
    res.status(200).json({ message: i18n.__("item_updated") });
  }

  async getCartItemsNumber(req: Request, res: Response) {
    const userId = req.currentUser.id;
    const cart = await this.cartService.getCartByUserId(userId);
    if (!cart) {
      throw new NotFoundError(i18n.__("cart_not_found"));
    }
    res.status(200).json(new SuccessResponse(cart.items.length));
  }
}

export { CartController };
