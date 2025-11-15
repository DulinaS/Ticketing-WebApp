import request from 'supertest';
import { app } from '../../app';

it('returns a 404 if the ticket is not found', async () => {
  const response = await request(app)
    .get('/api/tickets/fakeid')
    .send()
    .expect(404);
});

it('returns a ticket if the ticket is found', async () => {
  const title = 'Dummy Ticket';
  const price = 50;
  //Create a ticket and check if the ticket is exist use previous route to create
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
  console.log(response.body);

  //response contains the userid and we can make the followup request
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
