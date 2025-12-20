import request from 'supertest';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListenerKafka } from '../ticket-updated-listener-kafka';
import { kafkaWrapper } from '../../../kafka-wrapper';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListenerKafka(
    await kafkaWrapper.createConsumer('test-group')
  );

  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  //create a fake data event
  //Describe the data that would be in a TicketUpdatedEvent
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    userId: 'user123',
    title: 'concert',
    price: 999,
  };

  return { ticket, listener, data };
};

it('finds,updates, and saves a ticket', async () => {
  const { ticket, listener, data } = await setup();

  //This updates the ticket and saves it to the database
  await listener.onMessage(data, '0', 0);

  //Write assertions to make sure the ticket was updated correctly
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

//Test to make sure out of order events are not processed
it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data } = await setup();
  data.version = 10; //Skip to version 10

  //Try to use the listener to process the data object and message object
  try {
    await listener.onMessage(data, '0', 0);
  } catch (err) {
    //The error should be thrown for out of order events
    expect(err).toBeDefined();
  }
});
