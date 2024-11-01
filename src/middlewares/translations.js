"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.translations = void 0;
const path_1 = __importDefault(require("path"));
const i18n_1 = __importDefault(require("i18n"));
exports.i18n = i18n_1.default;
i18n_1.default.configure({
    locales: ["en", "tr", "de"],
    directory: path_1.default.join(__dirname, "..", "translations"),
    defaultLocale: "de",
});
const translations = (req, res, next) => {
    const acceptLanguageHeader = req.headers["accept-language"];
    const userPreferredLanguage = acceptLanguageHeader !== null && acceptLanguageHeader !== void 0 ? acceptLanguageHeader : "tr";
    req.language = userPreferredLanguage;
    i18n_1.default.setLocale(userPreferredLanguage);
    next();
};
exports.translations = translations;
