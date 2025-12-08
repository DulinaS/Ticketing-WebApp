import { Message } from 'node-nats-streaming';
import { Listener } from '../../../common/src/events/base-listener';
import { TicketCreatedEvent } from '../../../common/src/events/ticket-created-event';
import { Subjects } from '../../../common/src/events/subjects';

//Creating a specific listener by extending the abstract Listener class
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated; //Defining the subject to listen to
  queueGroupName = 'payments-service';

  //Defining the onMessage method
  //What to do when a message is received
  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data:', data);

    console.log(data.id);
    console.log(data.title);
    console.log(data.price);

    //Logic to process the data

    //We assume processin is succesfull
    //Acknowledge the message
    msg.ack();
  }
}
