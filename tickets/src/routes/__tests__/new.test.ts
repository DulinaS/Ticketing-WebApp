import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';
import { kafkaWrapper } from '../../kafka-wrapper';

describe('CREATE TICKET - Test Cases', () => {
  it('TC_TKT_001: Create a new ticket with valid title and price', async () => {
    console.log('\n--- TC_TKT_001: Create ticket with valid data ---');

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'Concert Ticket', price: 25.0 })
      .expect(201);

    console.log('Input: title="Concert Ticket", price=25.00');
    console.log('Response: 201 Created');
    console.log('Ticket:', response.body.title, '$' + response.body.price);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    console.log('✅ PASSED\n');
  });

  it('TC_TKT_002: Attempt to create a ticket with empty title field', async () => {
    console.log('\n--- TC_TKT_002: Create ticket with empty title ---');

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: '', price: 50.0 })
      .expect(400);

    console.log('Input: title="" (empty)');
    console.log('Response: 400 Bad Request');
    console.log('Error:', response.body.errors[0].message);
    console.log('✅ PASSED\n');
  });

  it('TC_TKT_003: Attempt to create a ticket with price set to zero', async () => {
    console.log('\n--- TC_TKT_003: Create ticket with zero price ---');

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'Movie Ticket', price: 0 })
      .expect(400);

    console.log('Input: price=0');
    console.log('Response: 400 Bad Request');
    console.log('Error:', response.body.errors[0].message);
    console.log('✅ PASSED\n');
  });

  it('TC_TKT_004: Attempt to create a ticket with negative price value', async () => {
    console.log('\n--- TC_TKT_004: Create ticket with negative price ---');

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'Sports Event', price: -10.0 })
      .expect(400);

    console.log('Input: price=-10.00');
    console.log('Response: 400 Bad Request');
    console.log('Error:', response.body.errors[0].message);
    console.log('✅ PASSED\n');
  });

  it('TC_TKT_005: Attempt to create a ticket without being logged in', async () => {
    console.log('\n--- TC_TKT_005: Create ticket without authentication ---');

    await request(app)
      .post('/api/tickets')
      .send({ title: 'Concert Ticket', price: 50.0 })
      .expect(401);

    console.log('Input: No authentication cookie');
    console.log('Response: 401 Unauthorized');
    console.log('Result: Access DENIED');
    console.log('✅ PASSED\n');
  });

  it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});
    expect(response.status).not.toEqual(404);
  });

  it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({});
    expect(response.status).not.toEqual(401);
  });

  it('publishes an event after ticket creation', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'validTitle',
        price: 10,
      })
      .expect(201);

    expect(kafkaWrapper.producer.send).toHaveBeenCalled();
  });
});
