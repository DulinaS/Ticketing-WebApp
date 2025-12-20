import {
  KafkaListener,
  OrderCreatedEvent,
  Subjects,
} from '@dulinatickets/common';
import { Consumer } from 'kafkajs';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListenerKafka extends KafkaListener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = 'expiration-service';

  constructor(consumer: Consumer) {
    super(consumer);
  }

  async onMessage(
    data: OrderCreatedEvent['data'],
    offset: string,
    partition: number
  ) {
    console.log('Order Created Event received via Kafka:', data.id);

    //delay is the time in milliseconds until the job should be processed
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    //Add a job to the expiration queue with a delay
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );
  }
}
