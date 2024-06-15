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

  async getCart(customerId: number) {
    const cart = await Cart.findOne({ customerId }).populate(
      "items.packageGroupId",
      "title"
    );
    return cart;
  }

  async getCartByCustomerId(customerId: number) {
    const cart = await Cart.findOne({ customerId })
      .populate("items.packageGroupId", "title price isSeatable icon type")
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
          price: item.packageGroupId.price,
          totalPrice: item.price,
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

  async getCartById(cartId: string) {
    const cart = await Cart.findById(cartId).populate(
      "items.packageGroupId",
      "type"
    );
    return cart;
  }

  async getCartByUserId(userId: number) {
    const cart = await Cart.findOne({ userId });
    return cart;
  }
}

export { CartService };
