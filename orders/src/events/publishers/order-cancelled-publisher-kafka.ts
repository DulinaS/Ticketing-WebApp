import {
  KafkaPublisher,
  Subjects,
  OrderCancelledEvent,
} from '@dulinatickets/common';

/**
 * Kafka Publisher for Order Cancelled Event
 * Publishes when an order is cancelled
 */
export class OrderCancelledPublisherKafka extends KafkaPublisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
