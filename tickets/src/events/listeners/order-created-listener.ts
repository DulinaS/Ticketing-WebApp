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
import mongoose from 'mongoose';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
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
      //Find the ticket that the order is reserving
      const ticket = await Ticket.findById(ticketId);

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
    } catch (error) {
      console.error('Error processing order:created event:', error);
      // Acknowledge the message to skip it and move on
      msg.ack();
    }
  }
}
