import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';

//Defining the structure of OrderCreatedEvent
export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated; //Subject of the event (link to Subjects enum)
  data: {
    id: string; //ID of the order
    status: OrderStatus; //Status of the order
    userId: string; //ID of the user who created the order
    expiresAt: string; //Expiration time of the order
    ticket: {
      id: string; //ID of the ticket associated with the order
      price: number; //Price of the ticket
    };
  };
}
