import {
  KafkaListener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { Order } from '../../models/order';

export class OrderCancelledListenerKafka extends KafkaListener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = 'payments-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: OrderCancelledEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Order Cancelled Event received via Kafka:', data.id);

    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    console.log('Order cancelled in payments database:', data.id);
  }
}
