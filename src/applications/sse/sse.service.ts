import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import {
  EVENT_SUBJECTS,
  TEventSubjects,
} from 'src/constants/event-subjects.constants';

@Injectable()
export class SSEService {
  private storedEventSubjects: Record<string, Subject<MessageEvent>> = {};

  constructor() {
    this.initStoredEventSubjects();
  }

  private initStoredEventSubjects() {
    Object.values(EVENT_SUBJECTS).forEach((subject) => {
      if (!this.storedEventSubjects[subject]) {
        this.storedEventSubjects[subject] = new Subject<MessageEvent>();
      }
    });
  }

  getEventStreamBySubject(subject: TEventSubjects): Observable<MessageEvent> {
    return this.storedEventSubjects[subject].asObservable();
  }

  emitEventsBySubject({
    subject,
    data,
  }: {
    subject: TEventSubjects;
    data: MessageEvent;
  }): void {
    if (this.storedEventSubjects[subject]) {
      console.log(`Emitting event for subject: ${subject}`, data);
      this.storedEventSubjects[subject].next(data);
    } else {
      throw new Error(`Subject ${subject} does not exist`);
    }
  }
}
