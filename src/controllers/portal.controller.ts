import { Request, Response } from "express";
import { CompanyService } from "../services";
import Stripe from "stripe";
import { NotFoundError } from "../errors/not-found-error";

class PortalController {
  private static instance: PortalController;
  static getInstance(companiesService: CompanyService) {
    if (!this.instance) {
      this.instance = new PortalController(companiesService);
    }
    return this.instance;
  }

  private constructor(private companiesService: CompanyService) {}

  async createCustomerPortal(req: Request, res: Response) {
    const stripeApi = new Stripe(process.env.STRIPE_RESTRICTED_KEY!);
    const { id: customerId } = req.currentUser;
    const customer = await this.companiesService.findCompanyId(customerId);
    const { authorizedPersonEmail } = customer;
    const stripeCustomer = await stripeApi.customers.list({
      email: authorizedPersonEmail,
      limit: 1,
    });
    console.log(stripeCustomer, "stripeCustomer");

    if (!stripeCustomer.data.length) {
      throw new NotFoundError(i18n.__("customer_not_found"));
    }

    const customerPortal = await stripeApi.billingPortal.sessions.create({
      customer: stripeCustomer.data[0].id,
      return_url: process.env.WEB_APP_URL,
    });

    res.status(200).json({ url: customerPortal.url });
  }
}

export { PortalController };
