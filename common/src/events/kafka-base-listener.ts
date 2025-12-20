import { Consumer, EachMessagePayload } from 'kafkajs';
import { Subjects } from './subjects';

/**
 * Generic Event interface
 */
interface Event {
  subject: Subjects;
  data: any;
}

/**
 * Kafka Listener Base Class
 * 
 * Key differences from NATS Listener:
 * - Uses Kafka Consumer instead of NATS Stan
 * - Consumer groups work similarly to NATS queue groups
 * - Manual commit (ack) after processing message
 * - Kafka handles offset management automatically
 * - Can consume from specific partitions or all partitions
 */
export abstract class KafkaListener<T extends Event> {
  abstract subject: T['subject']; // Topic to subscribe to
  abstract queueGroupName: string; // Consumer group name
  abstract onMessage(data: T['data'], offset: string, partition: number): Promise<void>; // Message handler

  protected consumer: Consumer; // Kafka consumer instance

  constructor(consumer: Consumer) {
    this.consumer = consumer;
  }

  /**
   * Start listening to messages from Kafka topic
   * Similar to NATS listen() but with Kafka semantics
   * Includes retry logic for topic metadata propagation
   */
  async listen(): Promise<void> {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // Subscribe to the topic
        // fromBeginning: true is similar to NATS setDeliverAllAvailable()
        await this.consumer.subscribe({
          topic: this.subject, // Kafka topic from Subjects enum
          fromBeginning: false, // Set to true to read all historical messages
        });

        console.log(`Subscribed to Kafka topic: ${this.subject} with group: ${this.queueGroupName}`);

        // Run the consumer
        await this.consumer.run({
          // Process each message
          eachMessage: async (payload: EachMessagePayload) => {
            const { topic, partition, message } = payload;

            console.log(
              `Message received: ${topic} / ${this.queueGroupName} / Partition: ${partition} / Offset: ${message.offset}`
            );

            // Parse the message
            const parsedData = this.parseMessage(message.value);

            try {
              // Call the abstract onMessage method
              await this.onMessage(parsedData, message.offset, partition);

              // Kafka automatically commits the offset after successful processing
              // This is similar to msg.ack() in NATS
              // The consumer is configured with autoCommit by default
            } catch (error) {
              console.error('Error processing message:', error);
              // In production, you might want to:
              // 1. Send to dead letter queue
              // 2. Retry with exponential backoff
              // 3. Log to monitoring system
              throw error; // Re-throw to prevent offset commit
            }
          },
        });

        // If we reach here, subscription was successful
        break;
      } catch (error: any) {
        // Check if error is retriable (topic doesn't exist yet)
        if (error.type === 'UNKNOWN_TOPIC_OR_PARTITION' && retries < maxRetries - 1) {
          retries++;
          const delay = 2000 * retries; // Exponential backoff: 2s, 4s, 6s, 8s
          console.log(
            `Topic ${this.subject} not ready yet. Retrying in ${delay}ms... (${retries}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error('Error in Kafka listener:', error);
          throw error;
        }
      }
    }
  }

  /**
   * Parse message value to typed data
   * @param messageValue - Raw message buffer from Kafka
   */
  parseMessage(messageValue: Buffer | null): T['data'] {
    if (!messageValue) {
      throw new Error('Message value is null');
    }

    const data = messageValue.toString('utf8');
    return JSON.parse(data);
  }

  /**
   * Disconnect the consumer
   */
  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    console.log(`Disconnected consumer for group: ${this.queueGroupName}`);
  }
}
