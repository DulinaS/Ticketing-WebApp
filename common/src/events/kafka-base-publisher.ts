import { Producer } from 'kafkajs';
import { Subjects } from './subjects';

/**
 * Generic Event interface
 * Same structure as NATS events
 */
interface Event {
  subject: Subjects;
  data: any;
}

/**
 * Kafka Publisher Base Class
 *
 * Key differences from NATS Publisher:
 * - Uses Kafka Producer instead of NATS Stan
 * - Messages are sent to topics (instead of subjects)
 * - Supports partitioning with optional key
 * - Messages are automatically serialized to JSON
 */
export abstract class KafkaPublisher<T extends Event> {
  abstract subject: T['subject']; // Topic to publish to
  protected producer: Producer; // Kafka producer instance

  constructor(producer: Producer) {
    this.producer = producer;
  }

  /**
   * Publish an event to Kafka
   * @param data - The event data to publish
   * @param key - Optional partition key (messages with same key go to same partition)
   */
  async publish(data: T['data'], key?: string): Promise<void> {
    try {
      await this.producer.send({
        topic: this.subject, // Kafka topic from Subjects enum
        messages: [
          {
            key: key, // Optional: ensures messages with same key go to same partition
            value: JSON.stringify(data), // Serialize data to JSON
            // Optional: Add headers for metadata
            headers: {
              'event-type': this.subject,
              'published-at': new Date().toISOString(),
            },
          },
        ],
      });

      console.log('Event published to Kafka topic:', this.subject);
    } catch (error) {
      console.error('Error publishing to Kafka:', error);
      throw error;
    }
  }
}
