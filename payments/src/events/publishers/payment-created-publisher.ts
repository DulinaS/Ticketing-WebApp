import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@dulinatickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
