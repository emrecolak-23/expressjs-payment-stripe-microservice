import { Subjects } from "../subjects";

type DataObject = {
  [key: string]: number | string;
};

export interface CompanyEvent {
  messageId: string;
  type: Subjects.COMPANY_INFO_UPDATED | Subjects.NEW_COMPANY_REGISTERED;
  body: DataObject;
}

export interface NewCompanyRegisteredEvent {
  messageId: string;
  type: Subjects.NEW_COMPANY_REGISTERED;
  body: {
    companyId: number;
    companyName: string;
    authorizedPersonName: string;
    authorizedPersonSurname: string;
    authorizedPersonEmail: string;
  };
}

export interface CompanyInfoReviewCompletedEvent {
  messageId: string;
  type: Subjects.COMPANY_INFO_UPDATED;
  body: {
    id: number;
    name: string;
  };
}
