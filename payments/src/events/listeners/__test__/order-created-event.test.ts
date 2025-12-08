import { OrderCreatedEvent, OrderStatus } from '@dulinatickets/common';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  //Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    expiresAt: 'asdasd',
    ticket: {
      id: 'fakeid',
      price: 100,
    },
  };
  //Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('creates and saves an order', async () => {
  const { listener, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  //Creates and saves an order
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order).toBeDefined();
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
