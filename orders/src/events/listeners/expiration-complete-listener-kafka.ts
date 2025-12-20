import {
  KafkaListener,
  ExpirationCompleteEvent,
  Subjects,
  OrderStatus,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { Order } from '../../models/order';
import { OrderCancelledPublisherKafka } from '../publishers/order-cancelled-publisher-kafka';
import { kafkaWrapper } from '../../kafka-wrapper';

export class ExpirationCompleteListenerKafka extends KafkaListener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = 'orders-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: ExpirationCompleteEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Expiration Complete Event received via Kafka:', data.orderId);

    //Find the order that the expiration event is for
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    //If the order is already complete, do not cancel it
    if (order.status === OrderStatus.Complete) {
      console.log('Order is already complete, not cancelling');
      return;
    }

    //Mark the order as cancelled
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    //Publish an event saying that the order was cancelled
    await new OrderCancelledPublisherKafka(kafkaWrapper.producer).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    console.log('Order cancelled due to expiration - published to Kafka');
  }
}
