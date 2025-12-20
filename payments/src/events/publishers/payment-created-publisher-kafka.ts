import {
  PaymentCreatedEvent,
  KafkaPublisher,
  Subjects,
} from '@dulinatickets/common';

export class PaymentCreatedPublisherKafka extends KafkaPublisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
