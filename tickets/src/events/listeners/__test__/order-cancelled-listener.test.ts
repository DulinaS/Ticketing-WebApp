import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from '@dulinatickets/common';
import { Ticket } from '../../../models/tickets';
import { kafkaWrapper } from '../../../kafka-wrapper';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledListenerKafka } from '../order-cancelled-listener-kafka';

//Setup function to create test environment
const setup = async () => {
  //Create an instance of the listener
  const listener = new OrderCancelledListenerKafka(
    await kafkaWrapper.createConsumer('test-group')
  );

  //Setup orderID
  const orderId = new mongoose.Types.ObjectId().toHexString();

  //Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 100,
    userId: 'user123',
  });

  //First we need to reserve the ticket by setting its orderId
  //Set the orderId of the ticket to  reservation
  ticket.set({ orderId });

  //Save the ticket to the database
  await ticket.save();

  //Create fake data object for OrderCancelledEvent
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  return { listener, ticket, data, orderId };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, ticket, data, orderId } = await setup();

  //Call the onMessage function with the data object + offset + partition
  await listener.onMessage(data, '0', 0); //Removes the orderId from the ticket and saves it

  //Retrieve the updated ticket
  const updatedTicket = await Ticket.findById(ticket.id);

  //Write assertions to make sure the ticket was updated;
  expect(updatedTicket!.orderId).not.toBeDefined(); //orderId should be undefined after cancellation

  //Ensure a ticket updated event was published
  expect(kafkaWrapper.producer.send).toHaveBeenCalled();
});
