import { Publisher, Subjects, OrderCreatedEvent } from '@dulinatickets/common';

//Creating a OrderCreatedPublisher class that extends the Publisher class
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
