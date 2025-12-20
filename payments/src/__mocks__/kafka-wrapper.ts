// Mock implementation of Kafka wrapper for testing
export const kafkaWrapper = {
  kafka: {
    producer: jest.fn(),
    consumer: jest.fn(),
    admin: jest.fn(),
  },
  producer: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue(undefined),
  },
  admin: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    createTopics: jest.fn().mockResolvedValue(undefined),
    listTopics: jest.fn().mockResolvedValue([]),
  },
  connect: jest.fn().mockResolvedValue(undefined),
  createConsumer: jest.fn().mockResolvedValue({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockResolvedValue(undefined),
    run: jest.fn().mockResolvedValue(undefined),
  }),
  ensureTopics: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
};
