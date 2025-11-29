import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from '@dulinatickets/common';

//Creating a OrderCreatedPublisher class that extends the Publisher class
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
