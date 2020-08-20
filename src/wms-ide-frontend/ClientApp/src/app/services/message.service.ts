import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';

@Injectable()
export class MessageService {
  messages: string[] = [];

  constructor(private notification: NzNotificationService) {}


  add(message: string) {
    this.messages.push(message);
  }

  clear() {
    this.messages = [];
  }

  show(type, title, text) {
    this.notification.create(type, title, text);
  }
}