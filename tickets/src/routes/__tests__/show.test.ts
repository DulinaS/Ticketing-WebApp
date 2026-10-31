import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';

describe('VIEW SINGLE TICKET - Test Cases', () => {
  it('TC_TKT_007: View details of a specific ticket', async () => {
    console.log('\n--- TC_TKT_007: View single ticket details ---');

    const createResponse = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'Summer Music Festival', price: 99.99 })
      .expect(201);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${createResponse.body.id}`)
      .send()
      .expect(200);

    console.log('Response: 200 OK');
    console.log(
      'Ticket:',
      ticketResponse.body.title,
      '$' + ticketResponse.body.price,
    );
    expect(ticketResponse.body.title).toEqual('Summer Music Festival');
    expect(ticketResponse.body.price).toEqual(99.99);
    console.log('✅ PASSED\n');
  });

  it('TC_TKT_008: Attempt to view a ticket that does not exist', async () => {
    console.log('\n--- TC_TKT_008: View non-existent ticket ---');

    await request(app)
      .get('/api/tickets/invalidticketid123')
      .send()
      .expect(404);

    console.log('Input: Invalid ticket ID');
    console.log('Response: 404 Not Found');
    console.log('✅ PASSED\n');
  });

  it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
      title: 'concert',
      price: 5,
      userId: 'asdf',
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
    await ticket.save();
    expect(ticket.version).toEqual(3);
  });
});
