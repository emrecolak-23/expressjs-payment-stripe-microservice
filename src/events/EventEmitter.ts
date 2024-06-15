import { EventEmitter } from "events";

export class CustomEventEmitter extends EventEmitter {
  private static instance: CustomEventEmitter;
  static getInstance() {
    if (!this.instance) {
      this.instance = new EventEmitter();
    }
    return this.instance;
  }
}
