import request from 'supertest';
import { app } from '../../app';

//To get the tickets first they have to be created
const createTicket = () => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'Dummy1',
    price: 10,
  });
};

//To get all tickets doesnt need to be authenticated
it('can fetch a list of tickets', async () => {
  //await key word is used to give time to create the ticket
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send().expect(200);

  //Asume a array is returned that has the tickets we check the content of the response

  expect(response.body.length).toEqual(3);
});
