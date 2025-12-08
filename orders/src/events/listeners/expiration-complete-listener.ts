import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    //Find the order that the expiration event is for
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    //If the order is already complete, do not cancel it
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    //Mark the order as cancelled
    order.set({ status: OrderStatus.Cancelled });

    await order.save(); //This will increment the version number

    //publish an event saying that the order was cancelled
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    //Acknowledging the message
    msg.ack();
  }
}
