import { Subjects } from './subjects';

//Defining the structure of OrderCancelledEvent
export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled; //Subject of the event (link to Subjects enum)
  data: {
    id: string; //ID of the order
    version: number; //Version number of the order
    ticket: {
      id: string; //ID of the ticket associated with the order
    };
  };
}
