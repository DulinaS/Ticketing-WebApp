import request from 'supertest';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper'; //mocked natsWrapper
import { TicketCreatedEvent } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketCreatedListenerKafka } from '../ticket-created-listener-kafka';
import { kafkaWrapper } from '../../../kafka-wrapper';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListenerKafka(
    await kafkaWrapper.createConsumer('test-group')
  );

  //create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(), //Generate real mongodb id
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(), //Generate real mongodb id
  };

  return { listener, data };
};

it('creates and saves a ticket', async () => {
  //Setup the listener, data object, and message object
  const { listener, data } = await setup();

  await listener.onMessage(data, '0', 0);
  //write assertions to make sure a ticket was created to the database with the same data
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});
