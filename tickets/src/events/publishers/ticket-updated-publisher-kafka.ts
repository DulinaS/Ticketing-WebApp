import { KafkaPublisher, Subjects, TicketUpdatedEvent } from '@dulinatickets/common';

/**
 * Kafka Publisher for Ticket Updated Event
 * 
 * This replaces the NATS TicketUpdatedPublisher
 */
export class TicketUpdatedPublisherKafka extends KafkaPublisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
