import { Listener, OrderCreatedEvent, Subjects } from '@dulinatickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  //To do when an order created event is received
  //We need to add a job to the expiration queue
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    //delay is the time in milliseconds until the job should be processed
    //We calculate the delay by subtracting the current time from the expiration time of the order
    //We set the expiration time at order creation
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    //Add a job to the expiration queue with a delay
    //This will ensure that the job is processed after the order expires
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );
    msg.ack();
  }
}
