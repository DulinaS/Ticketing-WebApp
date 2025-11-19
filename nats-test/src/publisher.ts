import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
//nat

console.clear();

//This is how we connect to nats server
//What does this do is it creates a client that connects to nats server
//After connecting to nats server we can publish and subscribe to events
//Our nats server is running in kubernetes cluster
const client = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

//After successful connection it emits a connect event
client.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(client);

  try {
    await publisher.publish({
      id: 'A123',
      title: 'Party',
      price: 50,
    });
  } catch (error) {
    console.error(error);
  }
});
