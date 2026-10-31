import { Kafka, Producer, Consumer, Admin } from 'kafkajs';

/**
 * Kafka Wrapper - Manages Kafka connections for the service
 * Similar to NatsWrapper but for Kafka
 *
 * Key differences from NATS:
 * - Kafka uses topics (similar to NATS subjects)
 * - Kafka uses consumer groups (similar to NATS queue groups)
 * - Kafka has built-in partitioning for scalability
 */
class KafkaWrapper {
  private _kafka?: Kafka;
  private _producer?: Producer;
  private _consumers: Map<string, Consumer> = new Map();
  private _admin?: Admin;

  /**
   * Get the Kafka instance
   * Throws error if not connected
   */
  get kafka() {
    if (!this._kafka) {
      throw new Error('Cannot access Kafka before connecting');
    }
    return this._kafka;
  }

  /**
   * Get the producer instance
   * Producer is used to publish messages to Kafka topics
   */
  get producer() {
    if (!this._producer) {
      throw new Error('Cannot access Kafka producer before connecting');
    }
    return this._producer;
  }

  /**
   * Get a consumer by group ID
   * Consumers subscribe to topics and receive messages
   */
  getConsumer(groupId: string): Consumer {
    const consumer = this._consumers.get(groupId);
    if (!consumer) {
      throw new Error(`Consumer with groupId ${groupId} not found`);
    }
    return consumer;
  }

  /**
   * Get admin client for topic management
   */
  get admin() {
    if (!this._admin) {
      throw new Error('Cannot access Kafka admin before connecting');
    }
    return this._admin;
  }

  /**
   * Connect to Kafka cluster
   * @param clientId - Unique identifier for this client (e.g., 'tickets')
   * @param brokers - Array of Kafka broker addresses (e.g., ['kafka:9092'])
   */
  async connect(clientId: string, brokers: string[]) {
    this._kafka = new Kafka({
      clientId,
      brokers,
      // Connection timeout
      connectionTimeout: 3000,
      // Retry configuration
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    // Create producer
    this._producer = this._kafka.producer();
    await this._producer.connect();
    console.log('Connected to Kafka Producer');

    // Create admin client for topic management
    this._admin = this._kafka.admin();
    await this._admin.connect();
    console.log('Connected to Kafka Admin');
  }

  /**
   * Create a consumer for a specific group
   * @param groupId - Consumer group ID (similar to NATS queue group)
   */
  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this._kafka) {
      throw new Error('Cannot create consumer before connecting to Kafka');
    }

    const consumer = this._kafka.consumer({
      groupId,
      // Start reading from the earliest message if no offset exists
      // Similar to NATS setDeliverAllAvailable()
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    this._consumers.set(groupId, consumer);
    console.log(`Created Kafka consumer for group: ${groupId}`);

    return consumer;
  }

  /**
   * Ensure topics exist, create if they don't
   * @param topics - Array of topic names to ensure exist
   */
  async ensureTopics(topics: string[]): Promise<void> {
    if (!this._admin) {
      throw new Error('Admin client not available');
    }

    const existingTopics = await this._admin.listTopics();
    const topicsToCreate = topics.filter(
      (topic) => !existingTopics.includes(topic)
    );

    if (topicsToCreate.length > 0) {
      await this._admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3, // Number of partitions per topic
          replicationFactor: 1, // Single broker, so replication factor is 1
        })),
      });
      console.log('Created Kafka topics:', topicsToCreate);
    }
  }

  /**
   * Disconnect all Kafka connections
   */
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

// Export a singleton instance
export const kafkaWrapper = new KafkaWrapper();
