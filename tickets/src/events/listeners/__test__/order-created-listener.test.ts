import request from 'supertest';
import { kafkaWrapper } from '../../../kafka-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../models/tickets';
import { OrderCreatedEvent, OrderStatus } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { OrderCreatedListenerKafka } from '../order-created-listener-kafka';

//Helper function to setup test environment
const setup = async () => {
  //Create an instance of the listener
  const listener = new OrderCreatedListenerKafka(
    await kafkaWrapper.createConsumer('test-group')
  );

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

  //fake msg object (Kafka doesn't need ack like NATS)
  const msg = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + offset + partition
  await listener.onMessage(data, '0', 0);

  //Retrieve the updated ticket afyer the listener added the orderId
  const updatedTicket = await Ticket.findById(ticket.id);

  //Write assertions to make sure orderId was set correctly
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  //Call the onMessage function with the data object + offset + partition
  await listener.onMessage(data, '0', 0);

  //Write assertions to make sure publish function is called
  expect(kafkaWrapper.producer.send).toHaveBeenCalled();

  //Get the data published
  const ticketUpdatedData = JSON.parse(
    (kafkaWrapper.producer.send as jest.Mock).mock.calls[0][0].messages[0].value
  );

  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
