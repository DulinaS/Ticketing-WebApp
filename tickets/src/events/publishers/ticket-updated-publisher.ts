import { Publisher, Subjects, TicketUpdatedEvent } from '@dulinatickets/common';

//Creating a TicketUpdatedPublisher class that extends the Publisher class
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
