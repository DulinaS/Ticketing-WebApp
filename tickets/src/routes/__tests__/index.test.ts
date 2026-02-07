import request from 'supertest';
import { app } from '../../app';

//To get the tickets first they have to be created
const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title,
    price,
  });
};

describe('VIEW ALL TICKETS - Test Cases', () => {
  it('TC_TKT_006: View list of all available (non-reserved) tickets', async () => {
    console.log('\n--- TC_TKT_006: View all available tickets ---');

    await createTicket('Concert Ticket', 50);
    await createTicket('Movie Ticket', 15);
    await createTicket('Sports Event', 75);
    console.log('Created 3 tickets');

    const response = await request(app).get('/api/tickets').send().expect(200);

    console.log('Response: 200 OK');
    console.log('Tickets found:', response.body.length);
    expect(response.body.length).toEqual(3);
    console.log('✅ PASSED\n');
  });
});
