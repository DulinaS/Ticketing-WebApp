import { kafkaWrapper } from './kafka-wrapper';
import { OrderCreatedListenerKafka } from './events/listeners/order-created-listener-kafka';

//This is the function that will start the application and connect to the MongoDB database
//We are using mongoose to connect to the MongoDB database
const start = async () => {
  //This is where we check if the KAFKA_BROKERS is defined
  if (!process.env.KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS must be defined');
  }
  //This is where we check if the KAFKA_CLIENT_ID is defined
  if (!process.env.KAFKA_CLIENT_ID) {
    throw new Error('KAFKA_CLIENT_ID must be defined');
  }

  try {
    //Connect to Kafka
    const kafkaBrokers = process.env.KAFKA_BROKERS.split(',');
    await kafkaWrapper.connect(process.env.KAFKA_CLIENT_ID, kafkaBrokers);

    //Graceful shutdown for Kafka
    process.on('SIGINT', async () => {
      await kafkaWrapper.disconnect();
      process.exit();
    });
    process.on('SIGTERM', async () => {
      await kafkaWrapper.disconnect();
      process.exit();
    });

    //Ensure Kafka topics exist
    await kafkaWrapper.ensureTopics(['order-created', 'expiration-complete']);

    //Create Kafka consumer for expiration service
    const consumer = await kafkaWrapper.createConsumer('expiration-service');

    //Subscribe to order-created topic
    await consumer.subscribe({
      topics: ['order-created'],
      fromBeginning: true, //Read missed events on first start of the consumer group
    });
    console.log('Subscribed to Kafka topic: order-created');

    //Create listener
    const orderCreatedListenerKafka = new OrderCreatedListenerKafka(consumer);

    //Start consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `Message received: ${topic} / expiration-service / Partition: ${partition} / Offset: ${message.offset}`
        );

        const parsedData = JSON.parse(message.value!.toString('utf8'));

        if (topic === 'order-created') {
          await orderCreatedListenerKafka.onMessage(
            parsedData,
            message.offset,
            partition
          );
        }
      },
    });
  } catch (err) {
    console.error(err);
  }
};
//This is the function that will start the application
start();
