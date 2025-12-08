import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@dulinatickets/common';
import { stripe } from '../../stripe';

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdasd',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin()) //This will create a different userId than the one associated with the order
    .send({
      token: 'asdasd',
      orderId: order.id,
    })
    .expect(401);
});
it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled, //Cancelled order
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId)) //This will create a different userId than the one associated with the order
    .send({
      token: 'asdasd',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const price = Math.floor(Math.random() * 100000); //Random price for the order

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  //Get the list of charges created during the test
  const charges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
});
