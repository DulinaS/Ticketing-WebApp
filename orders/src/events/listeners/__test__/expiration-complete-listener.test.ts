import { natsWrapper } from '../../../nats-wrapper';
import { kafkaWrapper } from '../../../kafka-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteEvent, OrderStatus } from '@dulinatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 100,
  });

  await ticket.save();

  //Create a order
  const order = Order.build({
    userId: 'user123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  //Create fake order expiration complete event data
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  //Create msg objetc
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(kafkaWrapper.producer.send).toHaveBeenCalled();

  //This is to check the data of the event published
  const eventData = JSON.parse(
    (kafkaWrapper.producer.send as jest.Mock).mock.calls[0][0].messages[0].value
  );
  //This is to make sure that the id of the order cancelled event matches the id of the order we created
  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
