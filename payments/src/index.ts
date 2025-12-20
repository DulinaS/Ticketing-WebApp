import mongoose from 'mongoose';
import { app } from './app'; //import app declatration
import { natsWrapper } from './nats-wrapper';
import { kafkaWrapper } from './kafka-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCreatedListenerKafka } from './events/listeners/order-created-listener-kafka';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCancelledListenerKafka } from './events/listeners/order-cancelled-listener-kafka';

//This is the function that will start the application and connect to the MongoDB database
//We are using mongoose to connect to the MongoDB database
const start = async () => {
  //This is where we check if the JWT_KEY is defined
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined'); //We throw an error if the JWT_KEY is not defined
  }

  //This is where we check if the MONGO_URI is defined
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  //This is where we check if the NATS_CLUSTER_ID is defined
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  //This is where we check if the NATS_CLIENT_ID is defined
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  //This is where we check if the NATS_URL is defined
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  //This is where we check if the KAFKA_BROKERS is defined
  if (!process.env.KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS must be defined');
  }
  //This is where we check if the KAFKA_CLIENT_ID is defined
  if (!process.env.KAFKA_CLIENT_ID) {
    throw new Error('KAFKA_CLIENT_ID must be defined');
  }
  //This is where we check if the STRIPE_KEY is defined
  if (!process.env.STRIPE_KEY) {
    throw new Error('STRIPE_KEY must be defined');
  }

  try {
    //Connect to NATS server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    //Graceful shutdown for NATS connection
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

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
    await kafkaWrapper.ensureTopics([
      'order-created',
      'order-cancelled',
      'payment-created',
    ]);

    //Create Kafka consumer for payments service
    const consumer = await kafkaWrapper.createConsumer('payments-service');

    //Subscribe to all topics at once (Kafka requires this before starting consumer)
    await consumer.subscribe({
      topics: ['order-created', 'order-cancelled'],
      fromBeginning: false,
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
          `Message received: ${topic} / payments-service / Partition: ${partition} / Offset: ${message.offset}`
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

    //Listen to order created and order cancelled events (OLD - NATS - will remove after full migration)
    // await new OrderCreatedListener(natsWrapper.client).listen();
    // await new OrderCancelledListener(natsWrapper.client).listen();

    //Connect to MongoDB database - MONGO_URI is defined in k8s tickets-depl.yaml
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Payments service listening on port 3000!!!');
  });
};
//This is the function that will start the application
start();
