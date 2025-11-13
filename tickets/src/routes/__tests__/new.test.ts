import request from 'supertest';
import { app } from '../../app';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('it can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
  //401 means the auther isnt authorized. In here we dont send a jwt token to check
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  console.log(response.status);
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  //Empty Title
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  //Without title
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  //invalid Price
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'abcd',
      price: -10,
    })
    .expect(400);

  //No price
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'abcd',
    })
    .expect(400);
});
it('create a ticket with valid inputs', async () => {});
