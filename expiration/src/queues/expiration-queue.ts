import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { ExpirationCompletePublisherKafka } from '../events/publishers/expiration-complete-publisher-kafka';
import { natsWrapper } from '../nats-wrapper';
import { kafkaWrapper } from '../kafka-wrapper';

//Define the payload structure for the expiration queue
interface Payload {
  orderId: string;
}
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

//To do when completed job is received from REDIS SERVER
expirationQueue.process(async (job) => {
  const eventData = {
    orderId: job.data.orderId,
  };

  //Publish to NATS (OLD - will remove after full migration)
  new ExpirationCompletePublisher(natsWrapper.client).publish(eventData);

  //Publish to Kafka (NEW)
  await new ExpirationCompletePublisherKafka(kafkaWrapper.producer).publish(
    eventData
  );
  console.log(
    'Expiration complete event published to Kafka for order:',
    job.data.orderId
  );
});

export { expirationQueue };
