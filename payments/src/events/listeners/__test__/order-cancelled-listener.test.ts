import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent } from '@dulinatickets/common';
import { OrderCancelledListenerKafka } from '../order-cancelled-listener-kafka';
import { kafkaWrapper } from '../../../kafka-wrapper';

const setup = async () => {
  const listener = new OrderCancelledListenerKafka(
    await kafkaWrapper.createConsumer('test-group')
  );

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

  return { listener, order, data };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data } = await setup();

  //Set the order status to cancelled
  await listener.onMessage(data, '0', 0);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
