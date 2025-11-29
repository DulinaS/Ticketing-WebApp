import { TicketCreatedEvent, Listener, Subjects } from '@dulinatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  //What to do when a message is received
  //Get data from the TicketCreatedEvent data property
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data; //Getting title and price from data

    //Building and saving a ticket
    //This ticket is for the orders service database
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    //Manually acknowledge the message
    msg.ack();
  }
}
