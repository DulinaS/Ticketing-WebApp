import { Publisher, Subjects, TicketCreatedEvent } from '@dulinatickets/common';

//Creating a TicketCreatedPublisher class that extends the Publisher class
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
