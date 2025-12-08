import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent } from '@dulinatickets/common';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  //Create fake order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'FakeUserId',
    status: OrderStatus.Created,
    version: 0,
    price: 100,
  });

  await order.save();

  ///Create fake order cancelled event data
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1, //1 = Because when cancelling an order, the version number will be incremented by 1
    ticket: {
      id: 'fakeTicketId',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  //Set the order status to cancelled
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, order, data, msg } = await setup();

  //Set the order status to cancelled
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
