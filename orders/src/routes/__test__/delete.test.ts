import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@dulinatickets/common';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import { kafkaWrapper } from '../../kafka-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
  const user = global.signin();
  //Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  //make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  //expect the order to be cancelled
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Publishes an event', async () => {
  const user = global.signin();
  //Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  //make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  expect(kafkaWrapper.producer.send).toHaveBeenCalled();
});
