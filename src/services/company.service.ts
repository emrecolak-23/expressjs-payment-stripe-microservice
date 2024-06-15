import { Company, CompanyModel, CompanyDoc } from "../models";

class CompanyService {
  private static instance: CompanyService;
  static getInstance() {
    if (!this.instance) {
      this.instance = new CompanyService();
    }
    return this.instance;
  }

  companyModel: CompanyModel;
  private constructor() {
    this.companyModel = Company;
  }

  async findCompanyId(companyId: number): Promise<CompanyDoc> {
    const company = await this.companyModel.findOne({ companyId });
    return company!;
  }

  async findCompanyByAuthorizedPersonEmail(email: string) {
    const company = await this.companyModel.findOne({
      authorizedPersonEmail: email,
    });

    return company;
  }
}

export { CompanyService };
