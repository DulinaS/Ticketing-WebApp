import { Kafka, Producer, Consumer, Admin } from 'kafkajs';

/**
 * Kafka Wrapper - Manages Kafka connections for the orders service
 */
class KafkaWrapper {
  private _kafka?: Kafka;
  private _producer?: Producer;
  private _consumers: Map<string, Consumer> = new Map();
  private _admin?: Admin;

  get kafka() {
    if (!this._kafka) {
      throw new Error('Cannot access Kafka before connecting');
    }
    return this._kafka;
  }

  get producer() {
    if (!this._producer) {
      throw new Error('Cannot access Kafka producer before connecting');
    }
    return this._producer;
  }

  getConsumer(groupId: string): Consumer {
    const consumer = this._consumers.get(groupId);
    if (!consumer) {
      throw new Error(`Consumer with groupId ${groupId} not found`);
    }
    return consumer;
  }

  get admin() {
    if (!this._admin) {
      throw new Error('Cannot access Kafka admin before connecting');
    }
    return this._admin;
  }

  async connect(clientId: string, brokers: string[]) {
    this._kafka = new Kafka({
      clientId,
      brokers,
      connectionTimeout: 3000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this._producer = this._kafka.producer();
    await this._producer.connect();
    console.log('Connected to Kafka Producer');

    this._admin = this._kafka.admin();
    await this._admin.connect();
    console.log('Connected to Kafka Admin');
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this._kafka) {
      throw new Error('Cannot create consumer before connecting to Kafka');
    }

    const consumer = this._kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    this._consumers.set(groupId, consumer);
    console.log(`Created Kafka consumer for group: ${groupId}`);

    return consumer;
  }

  async ensureTopics(topics: string[]): Promise<void> {
    if (!this._admin) {
      throw new Error('Admin client not available');
    }

    const existingTopics = await this._admin.listTopics();
    const topicsToCreate = topics.filter((topic) => !existingTopics.includes(topic));

    if (topicsToCreate.length > 0) {
      await this._admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });
      console.log('Created Kafka topics:', topicsToCreate);
    }
  }

  async disconnect(): Promise<void> {
    if (this._producer) {
      await this._producer.disconnect();
    }
    
    for (const [groupId, consumer] of this._consumers) {
      await consumer.disconnect();
      console.log(`Disconnected consumer for group: ${groupId}`);
    }
    
    if (this._admin) {
      await this._admin.disconnect();
    }

    console.log('Disconnected from Kafka');
  }
}

export const kafkaWrapper = new KafkaWrapper();
