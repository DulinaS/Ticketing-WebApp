import {
  ExpirationCompleteEvent,
  KafkaPublisher,
  Subjects,
} from '@dulinatickets/common';

export class ExpirationCompletePublisherKafka extends KafkaPublisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
