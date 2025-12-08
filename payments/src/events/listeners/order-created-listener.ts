import { Listener, OrderCreatedEvent, Subjects } from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, ticket, userId, status, version } = data;

    //Here we would normally create an order in our payments service database
    const order = Order.build({
      id,
      userId,
      status,
      version,
      price: ticket.price,
    });

    await order.save();
    msg.ack();
  }
}
