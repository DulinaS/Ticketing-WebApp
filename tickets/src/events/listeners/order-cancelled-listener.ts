import { Listener, OrderCancelledEvent, Subjects } from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    //If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    //Mark the ticket as being unreserved by clearing its orderId property
    ticket.set({ orderId: undefined });

    //Save the ticket
    await ticket.save();

    //Publish a ticket updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version, //After saving, the version is incremented. So new version is ticket.version
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    //acknowledge the message
    msg.ack();
  }
}
