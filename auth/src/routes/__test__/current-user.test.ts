import request from 'supertest';
import { app } from '../../app';

it('Responds with details about the current user', async () => {
  //First need to be signedup/ authenticated with app
  const authResponse = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com', //valid email to signup
      password: 'password', //valid password to signup
    })
    .expect(201); //user signed up

  //In this when signed up a cookie is sent to the user
  //That cookie is needed to get the current user
  const cookie = authResponse.get('Set-Cookie');
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
