import { Publisher, Event } from "./base.publisher";

export class EventNotificationPublisher extends Publisher<Event> {
  constructor(channel: any) {
    super(channel, ["event-notification-service"]);
  }
}
