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
exports.isCustomer = void 0;
const user_1 = require("../types/user");
const isCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_type: userType, id: companyId } = req.currentUser;
    if (userType !== user_1.UserTypes.INMIDI) {
        return res
            .status(403)
            .json({ message: "You are not authorized to access this resource" });
    }
    next();
});
exports.isCustomer = isCustomer;
