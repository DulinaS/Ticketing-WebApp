import {
  KafkaListener,
  OrderCancelledEvent,
  Subjects,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisherKafka } from '../publishers/ticket-updated-publisher-kafka';
import { kafkaWrapper } from '../../kafka-wrapper';

export class OrderCancelledListenerKafka extends KafkaListener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = 'tickets-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: OrderCancelledEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Order Cancelled Event received via Kafka:', data);

    //Find the ticket that was reserved
    const ticket = await Ticket.findById(data.ticket.id);

    //If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    //Mark the ticket as being unreserved by clearing its orderId property
    ticket.set({ orderId: undefined });

    //Save the ticket
    await ticket.save();

    //Publish a ticket updated event to Kafka
    await new TicketUpdatedPublisherKafka(kafkaWrapper.producer).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    console.log('Ticket unreserved and updated event published to Kafka');
  }
}
