import { Publisher, Event } from "./base.publisher";

export class ExceptionHandlerPublisher extends Publisher<Event> {
  constructor(channel: any) {
    super(channel, ["exception-handler-service"]);
  }
}
