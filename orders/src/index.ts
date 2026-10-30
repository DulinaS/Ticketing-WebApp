import mongoose from 'mongoose';
import { app } from './app'; //import app declatration
import { kafkaWrapper } from './kafka-wrapper';
import { TicketCreatedListenerKafka } from './events/listeners/ticket-created-listener-kafka';
import { TicketUpdatedListenerKafka } from './events/listeners/ticket-updated-listener-kafka';
import { ExpirationCompleteListenerKafka } from './events/listeners/expiration-complete-listener-kafka';
import { PaymentCreatedListenerKafka } from './events/listeners/payment-created-listener-kafka';

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
    await kafkaWrapper.ensureTopics([
      'ticket-created',
      'ticket-updated',
      'order-created',
      'order-cancelled',
      'expiration-complete',
      'payment-created',
    ]);

    //Create Kafka consumer for orders service
    const consumer = await kafkaWrapper.createConsumer('orders-service');

    //Subscribe to all topics at once (Kafka requires this before starting consumer)
    await consumer.subscribe({
      topics: [
        'ticket-created',
        'ticket-updated',
        'expiration-complete',
        'payment-created',
      ],
      fromBeginning: true, //Read missed events on first start of the consumer group
    });
    console.log(
      'Subscribed to Kafka topics: ticket-created, ticket-updated, expiration-complete, payment-created'
    );

    //Create listeners
    const ticketCreatedListenerKafka = new TicketCreatedListenerKafka(consumer);
    const ticketUpdatedListenerKafka = new TicketUpdatedListenerKafka(consumer);
    const expirationCompleteListenerKafka = new ExpirationCompleteListenerKafka(
      consumer
    );
    const paymentCreatedListenerKafka = new PaymentCreatedListenerKafka(
      consumer
    );

    //Start consumer and route messages to appropriate listeners
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `Message received: ${topic} / orders-service / Partition: ${partition} / Offset: ${message.offset}`
        );

        const parsedData = JSON.parse(message.value!.toString('utf8'));

        // Route to appropriate listener based on topic
        if (topic === 'ticket-created') {
          await ticketCreatedListenerKafka.onMessage(
            parsedData,
            message.offset,
            partition
          );
        } else if (topic === 'ticket-updated') {
          await ticketUpdatedListenerKafka.onMessage(
            parsedData,
            message.offset,
            partition
          );
        } else if (topic === 'expiration-complete') {
          await expirationCompleteListenerKafka.onMessage(
            parsedData,
            message.offset,
            partition
          );
        } else if (topic === 'payment-created') {
          await paymentCreatedListenerKafka.onMessage(
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
    console.log('Orders service listening on port 3000!!!');
  });
};
//This is the function that will start the application
start();
