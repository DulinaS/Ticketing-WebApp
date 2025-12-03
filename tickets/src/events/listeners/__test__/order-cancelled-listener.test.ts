import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from '@dulinatickets/common';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';

//Setup function to create test environment
const setup = async () => {
  //Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

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

  //fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, ticket, data, msg, orderId } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg); //Removes the orderId from the ticket and saves it

  //Retrieve the updated ticket
  const updatedTicket = await Ticket.findById(ticket.id);

  //Write assertions to make sure the ticket was updated
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).not.toBeDefined(); //orderId should be undefined after cancellation
  expect(msg.ack).toHaveBeenCalled(); //ack should be called

  //Ensure a ticket updated event was published
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
