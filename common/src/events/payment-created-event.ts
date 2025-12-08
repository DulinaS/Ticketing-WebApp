import { Subjects } from './subjects';

export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated;
  data: {
    id: string; //ID of the payment
    stripeId: string; //ID of the Stripe charge
    orderId: string; //ID of the order
  };
}
