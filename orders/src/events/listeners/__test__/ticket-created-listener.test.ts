import request from 'supertest';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper'; //mocked natsWrapper
import { TicketCreatedEvent } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(), //Generate real mongodb id
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(), //Generate real mongodb id
  };

  //create a fake message object
  // We don't need to implement all the methods in Message, just the ack method
  // use ts-ignore to ignore the type checking error
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(), //mock function to track if it's called
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  //Setup the listener, data object, and message object
  const { listener, data, msg } = await setup();

  //call the onMessage function with the data object + message object to build a ticket
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created to the database with the same data
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  //Setup the listener, data object, and message object
  const { listener, data, msg } = await setup();

  //call the onMessage function with the data object + message object to build a ticket
  await listener.onMessage(data, msg);

  //write assertions to make sure ack function is called to acknowledge the message
  expect(msg.ack).toHaveBeenCalled();
});
