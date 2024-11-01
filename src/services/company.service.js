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
exports.CompanyService = void 0;
const models_1 = require("../models");
class CompanyService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new CompanyService();
        }
        return this.instance;
    }
    constructor() {
        this.companyModel = models_1.Company;
    }
    findCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield this.companyModel.findOne({ companyId });
            return company;
        });
    }
    findCompanyByAuthorizedPersonEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield this.companyModel.findOne({
                authorizedPersonEmail: email,
            });
            return company;
        });
    }
}
exports.CompanyService = CompanyService;
