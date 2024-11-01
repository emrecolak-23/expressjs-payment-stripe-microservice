import { SubscriptionPackages, SubscriptionPackageModel } from "../models";
import { SubscriptionsType } from "../types/subscription";
import { CreateCalculatedPriceDto } from "../dtos";
import { consulInstance } from "..";
class SubscriptionPackageService {
  private static instance: SubscriptionPackageService;
  static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriptionPackageService();
    }
    return this.instance;
  }

  subscriptionModel: SubscriptionPackageModel;
  private constructor() {
    this.subscriptionModel = SubscriptionPackages;
  }

  async getSubscriptionPackage(packageGroupId: string) {
    const subscriptionPackage = await this.subscriptionModel
      .findOne({ _id: packageGroupId })
      .lean();

    return subscriptionPackage!;
  }

  async calculatePrice(params: CreateCalculatedPriceDto) {
    const { packageGroupId, numberOfSeats, durationType } = params;
    const subscriptionPackage = await this.subscriptionModel
      .findOne({ _id: packageGroupId })
      .lean();

    if (!subscriptionPackage) {
      return null;
    }

    let totalPrice = 0;

    if (subscriptionPackage.type === SubscriptionsType.GENERAL_CONSULTANCY) {
      totalPrice =
        numberOfSeats! *
        (subscriptionPackage.price -
          (subscriptionPackage.price * subscriptionPackage.discount!) / 100);
    } else if (subscriptionPackage.type === SubscriptionsType.INMIDI_SUBS) {
      if (durationType === 1) {
        totalPrice =
          subscriptionPackage.price -
          (subscriptionPackage.price * subscriptionPackage.discount!) / 100;
      } else if (durationType === 12) {
        totalPrice =
          subscriptionPackage.price * 12 -
          (subscriptionPackage.price * 12 * subscriptionPackage.discount!) /
            100;
      }
    }

    return parseFloat(totalPrice.toFixed(2));
  }

  async getPackageByType(type: string) {
    const subscriptionPackage = await this.subscriptionModel
      .findOne({ type })
      .lean();
    return subscriptionPackage!;
  }

  async getTranslatedPackage(item: any, acceptLanguage: string) {
    const kvConfig = `config/inmidi-packages/${item?.type}/${acceptLanguage}`;

    const consulClient = consulInstance.getConsulClient();
    const translatedPackage = await consulClient.kv.get(kvConfig);
    const resultTranslatedPackage = translatedPackage?.Value
      ? JSON.parse(translatedPackage.Value)
      : null;
    return {
      ...item,
      title: resultTranslatedPackage?.title || item.title,
      ...(resultTranslatedPackage?.explanation
        ? { explanation: resultTranslatedPackage.explanation }
        : {}),
    };
  }
}

export { SubscriptionPackageService };
