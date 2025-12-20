import {
  KafkaPublisher,
  Subjects,
  OrderCreatedEvent,
} from '@dulinatickets/common';

/**
 * Kafka Publisher for Order Created Event
 * Publishes when a new order is created
 */
export class OrderCreatedPublisherKafka extends KafkaPublisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
