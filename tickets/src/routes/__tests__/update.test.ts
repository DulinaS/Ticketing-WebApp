import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
  //Get a random valid userId
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

it('returns a 404 if the user does not own the tikcet', async () => {
  //Create ticket by one user another tries to update
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Dummy',
      price: 10,
    });

  //This request done by another user to the other user's URL
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin()) //global sign is called again so new cookie gets set becuase global sign in generates different user ids
    .send({
      title: 'Dummy',
      price: 100,
    })
    .expect(401);
});

it('return a 400 if the user provides an invalid title or price', async () => {
  //Get a single cookie and same user makes requests
  //global signin is set to generate different userIDs everytime we execute it
  const cookie = global.signin();

  //create ticket first
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Dummy',
      price: 10,
    });

  //Update
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '', //Update the title to empty
      price: 50,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'dummy',
      price: -50, //Update the price to invalid value
    })
    .expect(400);
});

it('updates the tikcet provided valid details', async () => {
  const cookie = global.signin();

  //create ticket first
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Dummy',
      price: 10,
    });

  //Update
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) //same Cookie is used to make and upadate ticket
    .send({
      title: 'Title Updated',
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('Title Updated');
  expect(ticketResponse.body.price).toEqual(100);
});
