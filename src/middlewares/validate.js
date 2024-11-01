"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const request_validation_error_1 = require("../errors/request-validation-error");
const translations_1 = require("./translations");
const validate = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const translatedErrors = error.details.map((detail) => {
            var _a, _b, _c, _d;
            const field = ((_a = detail.context) === null || _a === void 0 ? void 0 : _a.key) || "";
            const content = detail.type;
            let validValues;
            if (content == "any.only") {
                validValues = (_b = detail.context) === null || _b === void 0 ? void 0 : _b.valids.join(', ');
            }
            const translatedErrorMessage = translations_1.i18n.__(content, {
                label: translations_1.i18n.__((_c = detail.context) === null || _c === void 0 ? void 0 : _c.label),
                limit: ((_d = detail.context) === null || _d === void 0 ? void 0 : _d.limit) || 0,
                valids: validValues
            });
            return { message: translatedErrorMessage, field };
        });
        throw new request_validation_error_1.RequstValidationError(translatedErrors);
    }
    Object.assign(req, value);
    return next();
};
exports.validate = validate;
