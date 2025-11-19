import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

//Defining a generic Event interface
interface Event {
  subject: Subjects;
  data: any;
}

//Creating an abstract Listener class
abstract class Listener<T extends Event> {
  abstract subject: T['subject']; //Subject(Event) to listen to
  abstract queueGroupName: string; //Queue group name
  abstract onMessage(data: T['data'], msg: Message): void; //Method to handle the message

  private client: Stan; //NATS client
  protected ackWait = 5 * 1000; //5 seconds

  //Passing client through constructor
  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  //Method to start listening to events
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    //After subscription we need to listen to messages from nats server
    //'message' event is emitted when a message is received
    subscription.on('message', (msg: Message) => {
      console.log(`Message recieved: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  //Method to parse the message data
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}

export { Listener };
