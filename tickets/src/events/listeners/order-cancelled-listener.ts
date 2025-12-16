import { Listener, OrderCancelledEvent, Subjects } from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import mongoose from 'mongoose';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    try {
      // Handle both Buffer and string ticket IDs
      const id: any = data.ticket.id;
      let ticketId: string;

      if (typeof id === 'string') {
        ticketId = id;
      } else if (Buffer.isBuffer(id)) {
        ticketId = new mongoose.Types.ObjectId(id).toHexString();
      } else if (id && id.type === 'Buffer' && Array.isArray(id.data)) {
        // Handle deserialized Buffer from NATS - convert to ObjectId hex string
        const buffer = Buffer.from(id.data);
        ticketId = new mongoose.Types.ObjectId(buffer).toHexString();
      } else {
        ticketId = id._id || id;
      }

      console.log('Processed ticket ID:', ticketId, 'from:', id);
      const ticket = await Ticket.findById(ticketId);

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
    } catch (error) {
      console.error('Error processing order:cancelled event:', error);
      // Acknowledge the message to skip it and move on
      msg.ack();
    }
  }
}
