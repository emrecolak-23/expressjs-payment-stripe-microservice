import { Subjects } from "../subjects";

type DataObject = {
  [key: string]: number | string;
};

export interface SubscriptionEvent {
  messageId: string;
  type: Subjects.NEW_SUBSCRIPTION_CREATED;
  body: DataObject;
}

export interface NewSubscriptionCreatedEvent {
  messageId: string;
  type: Subjects.NEW_SUBSCRIPTION_CREATED;
  body: {
    subscriptionId: string;
    packageGroupId: string;
    paidPrice: number;
    customerId: number;
  };
}
