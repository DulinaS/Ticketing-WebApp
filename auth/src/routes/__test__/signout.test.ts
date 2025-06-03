import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  //In order to be signout you first has to be signed up
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com', //valid email to signup
      password: 'password', //valid password to signup
    })
    .expect(201); //user signed up

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  const cookie = response.get('Set-Cookie');
  if (!cookie) {
    throw new Error('Expected cookie but got undefined.');
  }

  expect(cookie[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
