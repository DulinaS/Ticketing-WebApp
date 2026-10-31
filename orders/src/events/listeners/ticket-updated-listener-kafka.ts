import {
  KafkaListener,
  TicketUpdatedEvent,
  Subjects,
} from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

/**
 * Kafka Listener for Ticket Updated Events
 * Listens when tickets are updated in the tickets service
 */
export class TicketUpdatedListenerKafka extends KafkaListener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: TicketUpdatedEvent['data'],
    offset: string,
    partition: number
  ): Promise<void> {
    console.log(
      `Processing ticket:updated - ID: ${data.id}, Version: ${data.version}, Partition: ${partition}, Offset: ${offset}`
    );

    // Find the ticket with version control
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    // Update the ticket with the new data
    ticket.set({ title, price });
    await ticket.save();

    console.log(`Ticket updated in orders database: ${data.id}`);
    // No manual ack needed - Kafka handles this automatically
  }
}
