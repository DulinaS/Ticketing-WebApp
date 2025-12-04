import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@dulinatickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
