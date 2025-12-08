import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  OrderStatus,
} from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    //Find the order that the payment is for
    const order = await Order.findById(data.orderId);
    //If no order, throw error
    if (!order) {
      throw new Error('Order not found');
    }
    //Mark the order as paid
    order.set({ status: OrderStatus.Complete });

    await order.save(); //Increments the version number of order

    //Ack the message
    msg.ack();
  }
}
