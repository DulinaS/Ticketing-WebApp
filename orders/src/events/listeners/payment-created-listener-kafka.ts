import {
  KafkaListener,
  PaymentCreatedEvent,
  OrderStatus,
  Subjects,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { Order } from '../../models/order';

export class PaymentCreatedListenerKafka extends KafkaListener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = 'orders-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: PaymentCreatedEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Payment Created Event received via Kafka:', data.orderId);

    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    console.log('Order marked as complete:', data.orderId);
  }
}
