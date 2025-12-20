import { OrderCreatedEvent, OrderStatus } from '@dulinatickets/common';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { OrderCreatedListenerKafka } from '../order-created-listener-kafka';
import { kafkaWrapper } from '../../../kafka-wrapper';

const setup = async () => {
  //Create an instance of the listener
  const listener = new OrderCreatedListenerKafka(
    await kafkaWrapper.createConsumer('test-group')
  );

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
  return { listener, data };
};

it('creates and saves an order', async () => {
  const { listener, data } = await setup();

  //Call the onMessage function with the data object + message object
  //Creates and saves an order
  await listener.onMessage(data, '0', 0);

  const order = await Order.findById(data.id);

  expect(order).toBeDefined();
  expect(order!.price).toEqual(data.ticket.price);
});
