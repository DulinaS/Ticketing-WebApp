import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { kafkaWrapper } from '../../kafka-wrapper';
import { Ticket } from '../../models/tickets';

describe('UPDATE TICKET - Test Cases', () => {
  it('TC_TKT_009: Update an existing ticket with valid data by ticket owner', async () => {
    console.log('\n--- TC_TKT_009: Update ticket by owner ---');

    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'Original Concert', price: 50 });
    console.log('Original:', response.body.title, '$' + response.body.price);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'Updated Concert VIP', price: 150 })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();
    console.log(
      'Updated:',
      ticketResponse.body.title,
      '$' + ticketResponse.body.price,
    );
    expect(ticketResponse.body.title).toEqual('Updated Concert VIP');
    expect(ticketResponse.body.price).toEqual(150);
    console.log('✅ PASSED\n');
  });

  it('TC_TKT_010: Attempt to update a ticket that belongs to another user', async () => {
    console.log('\n--- TC_TKT_010: Update ticket by non-owner (Security) ---');

    const userACookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', userACookie)
      .send({ title: 'User A Concert', price: 100 });
    console.log('User A created ticket');

    const userBCookie = global.signin();
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', userBCookie)
      .send({ title: 'Hacked', price: 1 })
      .expect(401);

    console.log('User B tried to update: 401 Unauthorized');
    console.log('Result: Update REJECTED');
    console.log('✅ PASSED\n');
  });

  it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'Dummy1',
        price: 10,
      })
      .expect(404);
  });

  it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: 'Dummy1',
        price: 10,
      })
      .expect(401);
  });

  it('return a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Dummy',
        price: 10,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 50,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'dummy',
        price: -50,
      })
      .expect(400);
  });

  it('publishes an event after update', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Dummy',
        price: 10,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Title Updated',
        price: 100,
      })
      .expect(200);

    expect(kafkaWrapper.producer.send).toHaveBeenCalled();
  });

  it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Dummy',
        price: 10,
      });

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Title Updated',
        price: 100,
      })
      .expect(400);
  });
});
