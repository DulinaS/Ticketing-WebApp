//Subjects are the channels in NATS Server and Kafka topics
//Kafka requires valid topic names (no colons allowed)
//Using hyphens for compatibility with both NATS and Kafka
export enum Subjects {
  TicketCreated = 'ticket-created',
  TicketUpdated = 'ticket-updated',
  OrderCreated = 'order-created',
  OrderCancelled = 'order-cancelled',
  ExpirationComplete = 'expiration-complete',
  PaymentCreated = 'payment-created',
}
