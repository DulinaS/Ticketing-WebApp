import request from 'supertest';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

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

  //create a fake message object
  // We don't need to implement all the methods in Message, just the ack method
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(), //mock function to track if it's called
  };

  return { ticket, listener, data, msg };
};

it('finds,updates, and saves a ticket', async () => {
  const { ticket, listener, data, msg } = await setup();

  //Use the listener to process the data object and message object
  //This updates the ticket and saves it to the database
  await listener.onMessage(data, msg);

  //Write assertions to make sure the ticket was updated correctly
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  //Use the listener to process the data object and message object
  //This updates the ticket and saves it to the database
  await listener.onMessage(data, msg);

  //Write assertions to make sure ack function is called to acknowledge the message
  expect(msg.ack).toHaveBeenCalled();
});

//Test to make sure out of order events are not processed
it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup();
  data.version = 10; //Skip to version 10

  //Try to use the listener to process the data object and message object
  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    //Write assertions to make sure ack function is not called to acknowledge the message
    expect(msg.ack).not.toHaveBeenCalled();
  }
});
