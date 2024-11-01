"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCurrency = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentCurrency;
(function (PaymentCurrency) {
    PaymentCurrency["EUR"] = "EUR";
    PaymentCurrency["USD"] = "USD";
})(PaymentCurrency || (exports.PaymentCurrency = PaymentCurrency = {}));
