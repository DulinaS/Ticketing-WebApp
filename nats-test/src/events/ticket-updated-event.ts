import { Subjects } from './subjects';

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated; //Subject of the event (link to Subjects enum)
  data: {
    id: string; //ID of the ticket
    title: string; //Title of the ticket
    price: number; //Price of the ticket
    userId: string;
  };
}
