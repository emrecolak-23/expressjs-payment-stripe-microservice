import { Request, Response, NextFunction } from "express";
import path from "path";
import i18n from "i18n";

i18n.configure({
  locales: ["en", "tr", "de"],
  directory: path.join(__dirname, "..", "translations"),
  defaultLocale: "de",
});

export const translations = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const acceptLanguageHeader = req.headers["accept-language"];
  const userPreferredLanguage = acceptLanguageHeader ?? "tr";
  req.language = userPreferredLanguage;
  i18n.setLocale(userPreferredLanguage);
  next();
};

export { i18n };
