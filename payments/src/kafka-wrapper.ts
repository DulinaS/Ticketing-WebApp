import { Kafka, Producer, Consumer, Admin } from 'kafkajs';

class KafkaWrapper {
  private _kafka?: Kafka;
  private _producer?: Producer;
  private _admin?: Admin;
  private _consumers: Consumer[] = [];

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
    });

    this._producer = this._kafka.producer();
    this._admin = this._kafka.admin();

    await this._producer.connect();
    console.log('Connected to Kafka Producer');

    await this._admin.connect();
    console.log('Connected to Kafka Admin');
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this._kafka) {
      throw new Error('Cannot create consumer before connecting to Kafka');
    }

    const consumer = this._kafka.consumer({ groupId });
    await consumer.connect();
    this._consumers.push(consumer);
    console.log(`Created Kafka consumer for group: ${groupId}`);

    return consumer;
  }

  async ensureTopics(topics: string[]) {
    const existingTopics = await this._admin!.listTopics();
    const topicsToCreate = topics.filter(
      (topic) => !existingTopics.includes(topic)
    );

    if (topicsToCreate.length > 0) {
      await this._admin!.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });
      console.log('Created Kafka topics:', topicsToCreate.join(', '));
    }
  }

  async disconnect() {
    if (this._producer) {
      await this._producer.disconnect();
    }
    for (const consumer of this._consumers) {
      await consumer.disconnect();
    }
    if (this._admin) {
      await this._admin.disconnect();
    }
    console.log('Disconnected from Kafka');
  }
}

export const kafkaWrapper = new KafkaWrapper();
