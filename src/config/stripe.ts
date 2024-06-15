import Stripe from "stripe";

class StripeService {
  private static _instance: StripeService;
  private _stripe: Stripe;

  private constructor() {
    this._stripe = new Stripe(process.env.STRIPE_RESTRICTED_KEY!);
  }

  public static getInstance(): StripeService {
    if (!StripeService._instance) {
      StripeService._instance = new StripeService();
    }
    return StripeService._instance;
  }

  public get stripeApi(): Stripe {
    return this._stripe;
  }
}

export default StripeService;
