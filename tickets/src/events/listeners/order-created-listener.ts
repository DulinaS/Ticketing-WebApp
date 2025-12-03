import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
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

    //Publish a ticket updated event
    //Access the NATS client via this.client inherited from the Listener class
    //We got client from OrderCreatedListener constructor
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version, //After saving, the version is incremented. So new version is ticket.version
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    //Acknowledge the message
    msg.ack();
  }
}
