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
exports.SubscriptionPackageService = void 0;
const models_1 = require("../models");
const subscription_1 = require("../types/subscription");
const __1 = require("..");
class SubscriptionPackageService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionPackageService();
        }
        return this.instance;
    }
    constructor() {
        this.subscriptionModel = models_1.SubscriptionPackages;
    }
    getSubscriptionPackage(packageGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionPackage = yield this.subscriptionModel
                .findOne({ _id: packageGroupId })
                .lean();
            return subscriptionPackage;
        });
    }
    calculatePrice(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { packageGroupId, numberOfSeats, durationType } = params;
            const subscriptionPackage = yield this.subscriptionModel
                .findOne({ _id: packageGroupId })
                .lean();
            if (!subscriptionPackage) {
                return null;
            }
            let totalPrice = 0;
            if (subscriptionPackage.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY) {
                totalPrice =
                    numberOfSeats *
                        (subscriptionPackage.price -
                            (subscriptionPackage.price * subscriptionPackage.discount) / 100);
            }
            else if (subscriptionPackage.type === subscription_1.SubscriptionsType.INMIDI_SUBS) {
                if (durationType === 1) {
                    totalPrice =
                        subscriptionPackage.price -
                            (subscriptionPackage.price * subscriptionPackage.discount) / 100;
                }
                else if (durationType === 12) {
                    totalPrice =
                        subscriptionPackage.price * 12 -
                            (subscriptionPackage.price * 12 * subscriptionPackage.discount) /
                                100;
                }
            }
            return parseFloat(totalPrice.toFixed(2));
        });
    }
    getPackageByType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionPackage = yield this.subscriptionModel
                .findOne({ type })
                .lean();
            return subscriptionPackage;
        });
    }
    getTranslatedPackage(item, acceptLanguage) {
        return __awaiter(this, void 0, void 0, function* () {
            const kvConfig = `config/inmidi-packages/${item === null || item === void 0 ? void 0 : item.type}/${acceptLanguage}`;
            const consulClient = __1.consulInstance.getConsulClient();
            const translatedPackage = yield consulClient.kv.get(kvConfig);
            const resultTranslatedPackage = (translatedPackage === null || translatedPackage === void 0 ? void 0 : translatedPackage.Value)
                ? JSON.parse(translatedPackage.Value)
                : null;
            return Object.assign(Object.assign(Object.assign({}, item), { title: (resultTranslatedPackage === null || resultTranslatedPackage === void 0 ? void 0 : resultTranslatedPackage.title) || item.title }), ((resultTranslatedPackage === null || resultTranslatedPackage === void 0 ? void 0 : resultTranslatedPackage.explanation)
                ? { explanation: resultTranslatedPackage.explanation }
                : {}));
        });
    }
}
exports.SubscriptionPackageService = SubscriptionPackageService;
