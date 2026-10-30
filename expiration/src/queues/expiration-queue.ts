import Queue from 'bull';
import { ExpirationCompletePublisherKafka } from '../events/publishers/expiration-complete-publisher-kafka';
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

  //Publish to Kafka, keyed by order id
  await new ExpirationCompletePublisherKafka(kafkaWrapper.producer).publish(
    eventData,
    job.data.orderId
  );
  console.log(
    'Expiration complete event published to Kafka for order:',
    job.data.orderId
  );
});

export { expirationQueue };
