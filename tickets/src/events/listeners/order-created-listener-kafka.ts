import {
  KafkaListener,
  OrderCreatedEvent,
  Subjects,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisherKafka } from '../publishers/ticket-updated-publisher-kafka';
import { kafkaWrapper } from '../../kafka-wrapper';

export class OrderCreatedListenerKafka extends KafkaListener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = 'tickets-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: OrderCreatedEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Order Created Event received via Kafka:', data);

    //Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //If not ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    //Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    //Save the ticket
    await ticket.save(); //This will also increment the version number

    //Publish a ticket updated event to Kafka
    await new TicketUpdatedPublisherKafka(kafkaWrapper.producer).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    console.log('Ticket reserved and updated event published to Kafka');
  }
}
