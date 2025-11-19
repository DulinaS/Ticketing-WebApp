import { Subjects } from './subjects';

//Defining the structure of TicketCreatedEvent
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated; //Subject of the event (link to Subjects enum)
  data: {
    id: string; //ID of the ticket
    title: string; //Title of the ticket
    price: number; //Price of the ticket
  };
}
