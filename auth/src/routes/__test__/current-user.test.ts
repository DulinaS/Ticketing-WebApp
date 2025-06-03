import request from 'supertest';
import { app } from '../../app';

it('Responds with details about the current user', async () => {
  //First need to be signedup/ authenticated with app
  //In this when signed up a cookie is sent to the user
  //That cookie is needed to get the current user

  //In setup.ts we have a method to make authenticated followup requests
  //It returns a cookie, using that we can make authenticated requests

  const cookie = await global.signin();
  if (!cookie) {
    throw new Error('Cookie not set after signup');
  }
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});
