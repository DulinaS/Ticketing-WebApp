import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';
import { Subjects } from './events/subjects';

console.clear();

//This is how we connect to nats server
const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

//After successful connection it emits a connect event
client.on('connect', () => {
  console.log('Listener connected to NATS');

  //After connection close event
  //We want to log that the connection is closed and exit the process
  client.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  //Creating an instance of TicketCreatedListener
  new TicketCreatedListener(client).listen();
});

//Graceful shutdown
//Before exiting we want to close the nats connection
//SIGNINT - interrupt signal from keyboard (ctrl+c)
//SIGTERM - termination signal from terminal - rs command
process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());
