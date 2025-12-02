import { Listener, TicketUpdatedEvent, Subjects } from '@dulinatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    //Find the ticket that we want to update
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }
    const { title, price } = data;
    //Update the ticket with the new data
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
