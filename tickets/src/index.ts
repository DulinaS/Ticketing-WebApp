import mongoose from 'mongoose';
import { app } from './app'; //import app declatration
import { kafkaWrapper } from './kafka-wrapper';
import { OrderCreatedListenerKafka } from './events/listeners/order-created-listener-kafka';
import { OrderCancelledListenerKafka } from './events/listeners/order-cancelled-listener-kafka';

//This is the function that will start the application and connect to the MongoDB database
//We are using mongoose to connect to the MongoDB database
const start = async () => {
  console.log('Starting up Tickets Service........');

  //This is where we check if the JWT_KEY is defined
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined'); //We throw an error if the JWT_KEY is not defined
  }

  //This is where we check if the MONGO_URI is defined
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
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
    const kafkaBrokers = process.env.KAFKA_BROKERS.split(','); // Support multiple brokers
    await kafkaWrapper.connect(process.env.KAFKA_CLIENT_ID, kafkaBrokers);

    //Graceful shutdown for Kafka connection
    process.on('SIGINT', async () => {
      await kafkaWrapper.disconnect();
      process.exit();
    });
    process.on('SIGTERM', async () => {
      await kafkaWrapper.disconnect();
      process.exit();
    });

    //Ensure required Kafka topics exist
    await kafkaWrapper.ensureTopics([
      'ticket-created',
      'ticket-updated',
      'order-created',
      'order-cancelled',
    ]);

    //Create Kafka consumer for tickets service
    const consumer = await kafkaWrapper.createConsumer('tickets-service');

    //Subscribe to all topics at once (Kafka requires this before starting consumer)
    await consumer.subscribe({
      topics: ['order-created', 'order-cancelled'],
      fromBeginning: true, //Read missed events on first start of the consumer group
    });
    console.log('Subscribed to Kafka topics: order-created, order-cancelled');

    //Create listeners
    const orderCreatedListenerKafka = new OrderCreatedListenerKafka(consumer);
    const orderCancelledListenerKafka = new OrderCancelledListenerKafka(
      consumer
    );

    //Start consumer and route messages to appropriate listeners
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `Message received: ${topic} / tickets-service / Partition: ${partition} / Offset: ${message.offset}`
        );

        const parsedData = JSON.parse(message.value!.toString('utf8'));

        // Route to appropriate listener based on topic
        if (topic === 'order-created') {
          await orderCreatedListenerKafka.onMessage(
            parsedData,
            message.offset,
            partition
          );
        } else if (topic === 'order-cancelled') {
          await orderCancelledListenerKafka.onMessage(
            parsedData,
            message.offset,
            partition
          );
        }
      },
    });

    //Connect to MongoDB database - MONGO_URI is defined in k8s tickets-depl.yaml
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Tickets service listening on port 3000!!!');
  });
};
//This is the function that will start the application
start();
