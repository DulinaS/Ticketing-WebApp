import { TicketCreatedEvent, KafkaListener, Subjects } from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

/**
 * Kafka Listener for Ticket Created Events
 * 
 * This replaces the NATS TicketCreatedListener
 * Key differences:
 * - Uses KafkaListener base class instead of Listener
 * - No manual ack() needed - Kafka auto-commits offsets
 * - Receives offset and partition information
 */
export class TicketCreatedListenerKafka extends KafkaListener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  /**
   * Handle incoming ticket:created events
   * @param data - Event payload
   * @param offset - Kafka message offset
   * @param partition - Kafka partition number
   */
  async onMessage(
    data: TicketCreatedEvent['data'],
    offset: string,
    partition: number
  ): Promise<void> {
    const { id, title, price } = data;

    console.log(
      `Processing ticket:created - ID: ${id}, Title: ${title}, Partition: ${partition}, Offset: ${offset}`
    );

    // Build and save ticket to orders database
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    console.log(`Ticket saved to orders database: ${id}`);

    // No manual ack needed - Kafka handles this automatically
  }
}
