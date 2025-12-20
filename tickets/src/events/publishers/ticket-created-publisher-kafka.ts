import { KafkaPublisher, Subjects, TicketCreatedEvent } from '@dulinatickets/common';

/**
 * Kafka Publisher for Ticket Created Event
 * 
 * This replaces the NATS TicketCreatedPublisher
 * Key difference: Uses KafkaPublisher base class instead of Publisher
 * 
 * Usage:
 * const publisher = new TicketCreatedPublisherKafka(kafkaWrapper.producer);
 * await publisher.publish({ id, title, price, userId, version });
 */
export class TicketCreatedPublisherKafka extends KafkaPublisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
