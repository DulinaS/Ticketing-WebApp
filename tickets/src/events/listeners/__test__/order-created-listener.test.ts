import request from 'supertest';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../models/tickets';
import { OrderCreatedEvent, OrderStatus } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

//Helper function to setup test environment
const setup = async () => {
  //Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 100,
    userId: 'user123',
  });
  await ticket.save();

  //Create fake data object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'user123',
    expiresAt: 'asdasd',
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Retrieve the updated ticket afyer the listener added the orderId
  const updatedTicket = await Ticket.findById(ticket.id);

  //Write assertions to make sure orderId was set correctly
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Write assertions to make sure publish function is called
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //Get the data published
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
