//Subjects are the channels in NATS Server
//There are different events so we can define different subjects for each event
export enum Subjects {
  TicketCreated = 'ticket:created',
  TicketUpdated = 'ticket:updated',
}
