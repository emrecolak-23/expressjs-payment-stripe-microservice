import { Cart, CartModel } from "../models";
import { CreateCartDto } from "../dtos";
import { PaymentCurrency } from "../types/payments";

class CartService {
  private static instance: CartService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CartService();
    }
    return this.instance;
  }

  cartModel: CartModel;
  private constructor() {
    this.cartModel = Cart;
  }

  async addToCart(data: CreateCartDto) {
    const cart = this.cartModel.build(data);
    await cart.save();
    return cart;
  }

  async checkCartIsExist(customerId: number) {
    return await Cart.findOne({ customerId });
  }

  async getCart(customerId: number) {
    const cart = await Cart.findOne({ customerId }).populate(
      "items.packageGroupId",
      "title"
    );
    return cart;
  }

  async getCartByCustomerId(customerId: number) {
    const cart = await Cart.findOne({ customerId })
      .populate(
        "items.packageGroupId",
        "title price isSeatable icon type discount"
      )
      .lean();
    if (!cart) {
      return cart;
    }
    const cartItems = cart?.items.map((item: any) => {
      return {
        _id: item.packageGroupId._id,
        title: item.packageGroupId.title,
        icon: item.packageGroupId.icon,
        type: item.packageGroupId.type,
        isSeatable: item.packageGroupId.isSeatable,
        price: {
          price:
            item.packageGroupId.price -
            (item.packageGroupId.price * item.packageGroupId.discount) / 100,
          totalPrice:
            item.price - (item.price * item.packageGroupId.discount) / 100,
          currency: PaymentCurrency.EUR,
          currencyPrefix: "€",
          ...(item.numberOfSeats ? { numberOfSeats: item.numberOfSeats } : {}),
          ...(item.durationType ? { durationType: item.durationType } : {}),
        },
      };
    });

    const totalPrice = cartItems.reduce((acc: any, item: any) => {
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
  }

  async deleteCartByCustomerId(customerId: number) {
    const cart = await Cart.deleteOne({ customerId });
    return cart;
  }

  async getCarByCustomerId(customerId: number) {
    const cart = await Cart.findOne({ customerId });
    return cart;
  }

  async deleteCouponFromCart(cartId: string) {
    const cart = await this.getCartById(cartId);
    if (cart) {
      cart.discount = 0;
      cart.couponId = undefined;
      return await cart.save();
    } else {
      return null;
    }
  }

  async getCartById(cartId: string) {
    const cart = await Cart.findById(cartId).populate(
      "items.packageGroupId",
      "type"
    );
    return cart;
  }

  async getCartByUserId(customerId: number) {
    const cart = await Cart.findOne({ customerId });
    return cart;
  }
}

export { CartService };
