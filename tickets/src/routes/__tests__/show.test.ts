import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';

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

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: 'asdf',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0); //First save, version should be 0

  await ticket.save();
  expect(ticket.version).toEqual(1); //Second save, version should be 1
  await ticket.save();
  expect(ticket.version).toEqual(2); //Third save, version should be 2
  await ticket.save();
  expect(ticket.version).toEqual(3); //Fourth save, version should be 3
});
