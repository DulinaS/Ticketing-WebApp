import {
  KafkaListener,
  OrderCreatedEvent,
  Subjects,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { Order } from '../../models/order';

export class OrderCreatedListenerKafka extends KafkaListener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = 'payments-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: OrderCreatedEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Order Created Event received via Kafka:', data.id);

    const { id, ticket, userId, status, version } = data;

    //Create an order in the payments service database
    const order = Order.build({
      id,
      userId,
      status,
      version,
      price: ticket.price,
    });

    await order.save();
    console.log('Order saved to payments database:', id);
  }
}
