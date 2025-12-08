import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

//Defining a generic Event interface
interface Event {
  subject: Subjects;
  data: any;
}

//Creating an abstract Publisher class
export abstract class Publisher<T extends Event> {
  abstract subject: T['subject']; //Subject(Event) to publish to

  private client: Stan; //NATS client

  //Passing client through constructor
  constructor(client: Stan) {
    this.client = client;
  }

  //Method to publish the event
  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log('Event published to subject', this.subject);
        resolve();
      });
    });
  }
}
